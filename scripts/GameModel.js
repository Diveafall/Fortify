
FORTIFY.model = (function(components, graphics, input) {
	var grid,
        towers = [],
        creeps = [],
        projectiles = [],
        clock,
        internalUpdate,
		internalRender,
		keyboard = input.Keyboard(),
        timeToNextSpawn = 0,
        internalMouseMove,
        internalMouseClick,
		keyboard = input.Keyboard(),
        testCreepLeftRight, // Used for checking that creep still have paths. Never updated or rendered.
        testCreepTopBottom;

	//------------------------------------------------------------------
	//
	// Prepares a newly initialized game model, ready for the start of
	// the game.
	//
	//------------------------------------------------------------------
	function initialize() {
        console.log('game model initialization');
        grid = components.GameGrid({ frame: graphics.canvasFrame() });
        clock = FORTIFY.Clock();
        clock.start(document.getElementById('time-label'));
        
        graphics.getCanvas().onclick = function(event) { internalMouseClick(event); };
        graphics.getCanvas().onmousemove = function(event) { internalMouseMove(event); };
        
        FORTIFY.Util.init();
        
        testCreepLeftRight = components.Creep(grid, 0);
        testCreepTopBottom = components.Creep(grid, 2);
        
        internalUpdate = updatePlaying;
        internalRender = renderPlaying;
        
        internalMouseClick = playingMouseClick;
        internalMouseMove = playingMouseMove;
        
        // Temporary
        keyboard.registerCommand(KeyEvent.DOM_VK_B, buyTower);
	}
    
    // Temporary for ease of use when purchasing towers
    function buyTower() {
        towerPurchased(FORTIFY.components.Tower.Turbolaser);
    }
    
    //------------------------------------------------------------------
	//
	// A tower has been selected from the Tower Store
	//
	//------------------------------------------------------------------
    function towerPurchased(TowerType) {  
        var tower = TowerType({ containerFrame: grid.frame, projectiles: projectiles }); // create the tower      
        grid.beginPlacement(tower); // pass it to grid for placement setup
        FORTIFY.StatsPanel.towerSelected(tower, true); // show the new tower on stats panel
        
        // switch to placing
        internalRender = renderPlacing;
        internalUpdate = updatePlacing;
        
        internalMouseMove = placementMouseMove;
        internalMouseClick = placementMouseClick;
    }
    
    function towerSold(tower) {
        grid.removeTowerFromGrid(tower);
        var index = towers.indexOf(tower);
        towers.splice(index, 1);
        // TODO: ADD GOLD TO TREASURY
    }

	//------------------------------------------------------------------
	//
	// Handle any keyboard input
	//
	//------------------------------------------------------------------
	function processInput(elapsedTime) {
		keyboard.update(elapsedTime);
	}
    
    //------------------------------------------------------------------
	//
	// Handle mouse move during tower placement
	//
	//------------------------------------------------------------------
	function placementMouseMove(event) {
        grid.update(event.offsetX, event.offsetY);
	}
    
    //------------------------------------------------------------------
	//
	// Handle mouse move during tower placement
	//
	//------------------------------------------------------------------
	function playingMouseMove(event) {
	}
    
    //------------------------------------------------------------------
	//
	// Handle mouse click during tower placement
	//
	//------------------------------------------------------------------
	function placementMouseClick(event) {
        if (grid.isPlacing()) {
            if (grid.isValid()) { // grid can accomodate this tower
                // places the tower in the grid, remembers it
                var tower = grid.endPlacement(true),
                    towerWasValid = true;
                    
                // Test entire path from left to right and top to bottom
                towerWasValid = testCreepLeftRight.updatePath(grid) 
                    && testCreepTopBottom.updatePath(grid);
                
                // Check each creep to ensure they still have paths
                for (var i = 0; i < creeps.length && towerWasValid; ++i) {
                    towerWasValid = creeps[i].updatePath(grid);
                }
                
                if (towerWasValid) {
                    // if we got here, then all creeps have paths
                    towers.push(tower); // push tower to container
                    FORTIFY.StatsPanel.hide(); // hide the stats panel
                    
                    // switch to playing
                    internalUpdate = updatePlaying;
                    internalRender = renderPlaying;
                    
                    internalMouseMove = playingMouseMove;
                    internalMouseClick = playingMouseClick;
                } else {
                    // remove the tower from the grid
                    grid.removeTowerFromGrid(tower);
                    
                    // Redo all paths for creeps
                    for (var i = 0; i < creeps.length; i++) {
                        creeps[i].updatePath(grid);
                    }
                    
                    // TODO: Notify user of bad placement
                    console.log("Invalid tower placement!");
                    
                    // continue tower placement
                    grid.beginPlacement(tower);
                }
            }
        }
	}
    
    //------------------------------------------------------------------
	//
	// Handle mouse click during tower placement
	//
	//------------------------------------------------------------------
	function playingMouseClick(event) {
        var point = { x: event.offsetX, y: event.offsetY };
        for (var i = 0; i < towers.length; ++i) {
            if (towers[i].doesContain(point)) {
                FORTIFY.StatsPanel.towerSelected(towers[i]);
                return;
            }
        }
        FORTIFY.StatsPanel.towerSelected(undefined);
	}
    
    //------------------------------------------------------------------
	//
	// Update state of the game while placing
	//
	//------------------------------------------------------------------
    function updatePlacing(elapsedTime) {
    }
    
    //------------------------------------------------------------------
    //
	// Update creeps
	//
	//------------------------------------------------------------------
    function updateCreeps(elapsedTime) {
        var i,
            creepsToRemove = [];
        for (i = 0; i < creeps.length; i++) {
            if (creeps[i].update(elapsedTime, grid)) {
                // Died or reached end, remove
                if (creeps[i].reachedEnd()) {
                    // TODO - Remove one health from player
                } else {
                    // TODO - Add points, render score floating from creep death
                }
                creepsToRemove.push(i);
            }
        }
        
        for (i = creepsToRemove.length; i--; i >= 0) {
            creeps.splice(creepsToRemove[i], 1);
        }
        
        timeToNextSpawn -= elapsedTime;
        if (timeToNextSpawn <= 0) {
            creeps.push(components.Creep(grid));
            timeToNextSpawn = 4000;
        }
    }
    
    //------------------------------------------------------------------
	//
	// Update state of the game while playing
	//
	//------------------------------------------------------------------
    function updatePlaying(elapsedTime) {
        var i;
            
        // Creep updates
        updateCreeps(elapsedTime);
        
        // Tower updates
        for (i = 0; i < towers.length; ++i) {
            towers[i].update(elapsedTime);
        }
        
        // Projectile updates
        for (i = projectiles.length - 1; i >= 0; i--) {
            projectiles[i].update(elapsedTime);
            if (!projectiles[i].isWithinBounds()) { // if projectile is out of its bounds
                projectiles.splice(i, 1); // remove it
            } else {
                for (var j = 0; j < creeps.length; ++j) { // projectile hasn't died let's see if it has collided with any creep
                    if (projectiles[i].didCollideWith(creeps[j])) { // if they collided
                        creeps[j].takeDamage(10); // creep takes damage
                        projectiles.splice(i, 1); // remove projectile
                        break;
                    }
                }
            }
        }
        
        keyboard.update(elapsedTime);
    }
    
    //------------------------------------------------------------------
	//
	// Render state of the game while placing
	//
	//------------------------------------------------------------------
    function renderPlacing() {
        grid.render(graphics);
        for (var i = 0; i < towers.length; ++i) {
            graphics.drawTower(towers[i], false);
        }
        for (var i = 0; i < creeps.length; i++) {
            creeps[i].render(graphics)
            //graphics.drawCreep(creeps[i]);
        }
    }
    
    //------------------------------------------------------------------
	//
	// Render the state of the game while playing
	//
	//------------------------------------------------------------------
	function renderPlaying() {
        clock.outputClock();
        for (var i = 0; i < towers.length; ++i) {
            graphics.drawTower(towers[i], false);
        }
        for (var i = 0; i < projectiles.length; ++i) {
            graphics.drawProjectile(projectiles[i]);
        }
        for (var i = 0; i < creeps.length; i++) {
            creeps[i].render(graphics);
            //graphics.drawCreep(creeps[i]);
        }
	}

	//------------------------------------------------------------------
	//
	// Update the state of the game model based upon the passage of time.
	//
	//------------------------------------------------------------------
	function update(elapsedTime) {
		internalUpdate(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// Render the current state of the game model.
	//
	//------------------------------------------------------------------
	function render() {
		internalRender();
	}
    
    

	return {
		initialize: initialize,
		processInput: processInput,
		update: update,
		render: render,
        towerPurchased: towerPurchased,
        towerSold: towerSold,
        creeps: creeps
	};
}) (FORTIFY.components, FORTIFY.graphics, FORTIFY.input);

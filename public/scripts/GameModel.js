
FORTIFY.model = (function(components, graphics, input, particles, score) {
	var grid,
        towers = [],
        creeps = [],
        projectiles = [],
        remainingLives = 50,
        level = 0,
        gameOver = false,
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
        
        var leftRightSpec = {
            grid: grid,
            level: 0,
            whichPath: 0,
            type: 0
        };
        var topBottomSpec = {
            grid: grid,
            level: 0,
            whichPath: 2,
            type: 0
        }
        testCreepLeftRight = components.Creep.createCreep(leftRightSpec);
        testCreepTopBottom = components.Creep.createCreep(topBottomSpec);
        
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
    
    // Create creep death particles
    function creepDeath(creep) {
        var effectSpec = {
            type: 'creep' + (creep.type + 1), // Add one to match actual image names
            center: creep.center,
            speed: {mean: 20, stdev: 2},
            size: {mean: 5, stdev: 1},
            lifetime: { mean: 0.75, stdev: 0.25},
            particleCount: 15,
            spin: true
        }
        particles.createEffect(effectSpec);
        
        var textSpec = {
            text: creep.points,
            font: '16px Arial',
            center: creep.center,
            direction: {x: 0, y: -Math.PI/2},
            speed: 20,
            size: 16,
            lifetime: 1
        }
        particles.createText(textSpec);
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
                    remainingLives--;
                } else {
                    creepDeath(creeps[i]);
                    score.add(creeps[i].points);
                }
                creepsToRemove.push(i);
            }
        }
        
        for (i = creepsToRemove.length; i--; i >= 0) {
            creeps.splice(creepsToRemove[i], 1);
        }
        
        timeToNextSpawn -= elapsedTime;
        if (timeToNextSpawn <= 0) {
            var creepSpec = {
                grid: grid,
                level: level
            }
            creeps.push(components.Creep.createCreep(creepSpec));
            timeToNextSpawn = 4000;
        }
    }
    
    function endGame() {
        gameOver = true;
        score.addEndGameScore(towers, level);
        score.submit();
        console.log("Game over!");
    }
    
    //------------------------------------------------------------------
	//
	// Update state of the game while playing
	//
	//------------------------------------------------------------------
    function updatePlaying(elapsedTime) {
        var i;
        
        if (gameOver) {
            return;
        } else if (remainingLives <= 0) {
            endGame();
        }
            
        // Creep updates
        updateCreeps(elapsedTime);
        
        // Tower updates
        for (i = 0; i < towers.length; ++i) {
            towers[i].update(elapsedTime);
        }
        
        // Projectile updates
        for (i = projectiles.length - 1; i >= 0; i--) {
            projectiles[i].update(elapsedTime);
            if (projectiles[i].type === 'guided') {
                var effectSpec = {
                    type: 'smoke',
                    center: projectiles[i].center,
                    speed: {mean: 20, stdev: 2},
                    size: {mean: 3, stdev: 1},
                    lifetime: { mean: 0.5, stdev: 0.25},
                    particleCount: 6,
                    spin: true
                }
                particles.createEffect(effectSpec);
            }
            if (!projectiles[i].isWithinBounds()) { // if projectile is out of its bounds
                projectiles.splice(i, 1); // remove it
            } else {
                for (var j = 0; j < creeps.length; ++j) { // projectile hasn't died let's see if it has collided with any creep
                    if (projectiles[i].didCollideWith(creeps[j])) { // if they collided
                        creeps[j].takeDamage(projectiles[i].damage); // creep takes damage
                        if (projectiles[i].type === 'guided') {
                            var effectSpec = {
                                type: 'fire',
                                center: projectiles[i].center,
                                speed: {mean: 10, stdev: 5},
                                size: {mean: 10, stdev: 1},
                                lifetime: { mean: 0.5, stdev: 0.3},
                                particleCount: 20,
                                spin: true
                            }
                            particles.createEffect(effectSpec);
                        }
                        projectiles.splice(i, 1); // remove projectile
                        break;
                    }
                }
            }
        }
        
        particles.update(elapsedTime);
        
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
        }
        particles.render(graphics);
        score.render();
        document.getElementById('level-label').innerHTML = level;
        document.getElementById('lives-label').innerHTML = remainingLives;
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
        creeps: creeps,
        projectiles: projectiles
	};
}) (FORTIFY.components, FORTIFY.graphics, FORTIFY.input, FORTIFY.particles, FORTIFY.score);

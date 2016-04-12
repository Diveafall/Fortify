
FORTIFY.model = (function(components, graphics, input) {
	var grid,
        towers = [],
        creeps = [],
        projectiles = [],
        internalUpdate,
		internalRender,
		keyboard = input.Keyboard(),
        timeToNextSpawn = 0,
        internalMouseMove,
        internalMouseClick,
		keyboard = input.Keyboard();

	//------------------------------------------------------------------
	//
	// Prepares a newly initialized game model, ready for the start of
	// the game.
	//
	//------------------------------------------------------------------
	function initialize() {
        console.log('game model initialization');
        grid = components.GameGrid({ frame: graphics.canvasFrame() });
        
        graphics.getCanvas().onclick = function(event) { internalMouseClick(event); };
        graphics.getCanvas().onmousemove = function(event) { internalMouseMove(event); };
        
        FORTIFY.Util.init();
        
        internalUpdate = updatePlaying;
        internalRender = renderPlaying;
        
        internalMouseClick = playingMouseClick;
        internalMouseMove = playingMouseMove;
	}
    
    //------------------------------------------------------------------
	//
	// A tower has been selected from the Tower Store
	//
	//------------------------------------------------------------------
    function towerPurchased(TowerType) {        
        grid.beginPlacement(TowerType({
            containerFrame: grid.frame,
            projectiles: projectiles
        }));
        
        internalRender = renderPlacing;
        internalUpdate = updatePlacing;
        
        internalMouseMove = placementMouseMove;
        internalMouseClick = placementMouseClick;
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
        var point = { x: event.offsetX, y: event.offsetY };
        for (var i = 0; i < towers.length; ++i) {
            towers[i].turn(point);
        }
        for (var i = 0; i < projectiles.length; ++i) {
            if (projectiles[i].setTarget) { projectiles[i].setTarget(point); }
        }
	}
    
    //------------------------------------------------------------------
	//
	// Handle mouse click during tower placement
	//
	//------------------------------------------------------------------
	function placementMouseClick(event) {
        if (grid.isPlacing()) {
            if (grid.isValid()) {
                // TODO - add tower, call updatePath(grid) for all creeps
                // make sure they have paths
                // remove the placed tower if one creep has no path
                
                // Also - maybe create two temporary creeps that move in both directions
                // If they don't have paths, don't allow
                towers.push(grid.endPlacement(true));
                
                internalUpdate = updatePlaying;
                internalRender = renderPlaying;
                
                internalMouseMove = playingMouseMove;
                internalMouseClick = playingMouseClick;
            }
        }
	}
    
    //------------------------------------------------------------------
	//
	// Handle mouse click during tower placement
	//
	//------------------------------------------------------------------
	function playingMouseClick(event) {
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
            timeToNextSpawn = 5000;
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
            if (!projectiles[i].isWithinBounds()) {
                projectiles.splice(i, 1);
            }
        }
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
            graphics.drawCreep(creeps[i]);
        }
    }
    
    //------------------------------------------------------------------
	//
	// Render the state of the game while playing
	//
	//------------------------------------------------------------------
	function renderPlaying() {
        for (var i = 0; i < towers.length; ++i) {
            graphics.drawTower(towers[i], false);
        }
        for (var i = 0; i < projectiles.length; ++i) {
            graphics.drawProjectile(projectiles[i]);
        }
        for (var i = 0; i < creeps.length; i++) {
            graphics.drawCreep(creeps[i]);
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
        towerPurchased: towerPurchased
	};
} (FORTIFY.components, FORTIFY.graphics, FORTIFY.input));

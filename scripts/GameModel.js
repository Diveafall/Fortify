
FORTIFY.model = (function(components, graphics, input) {
	var grid,
        towers = [],
        creeps = [],
        projectiles = [],
        internalUpdate,
		internalRender,
		keyboard = input.Keyboard(),
        timeToNextSpawn = 5000, // temp to spawn a new creep every second
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
	// Update state of the game while playing
	//
	//------------------------------------------------------------------
    function updatePlaying(elapsedTime) {
        for (var i = 0; i < creeps.length; i++) {
            creeps[i].update(elapsedTime, grid);
        }
        timeToNextSpawn -= elapsedTime;
        if (timeToNextSpawn <= 0) {
            creeps.push(components.Creep(grid));
            timeToNextSpawn = 5000;
        }
        for (var i = 0; i < towers.length; ++i) {
            towers[i].update(elapsedTime);
        }
        for (var i = projectiles.length - 1; i >= 0; i--) {
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
        for (var i = 0; i < creeps.length; i++) {
            graphics.drawCreep(creeps[i]);
        }
	}

	return {
		initialize: initialize,
		processInput: processInput,
		update: update,
		render: render,
        towerPurchased: towerPurchased
	};
} (FORTIFY.components, FORTIFY.graphics, FORTIFY.input));

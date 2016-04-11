
FORTIFY.model = (function(components, graphics, input) {
	var grid,
        towers = [],
        creeps = [],
        internalUpdate,
		internalRender,
		keyboard = input.Keyboard(),
        timeToNextSpawn = 5000; // temp to spawn a new creep every second

	//------------------------------------------------------------------
	//
	// Prepares a newly initialized game model, ready for the start of
	// the game.
	//
	//------------------------------------------------------------------
	function initialize() {
        console.log('game model initialization');
        grid = components.GameGrid({ frame: graphics.canvasFrame() });
        
        graphics.getCanvas().onclick = processMouseClick;
        
        FORTIFY.Util.init();
        
        internalUpdate = updatePlaying;
        internalRender = renderPlaying;
	}
    
    //------------------------------------------------------------------
	//
	// A tower has been selected from the Tower Store
	//
	//------------------------------------------------------------------
    function towerPurchased(TowerType) {
        grid.beginPlacement(TowerType);
        graphics.getCanvas().onmousemove = function(event) {
            grid.update(event.offsetX, event.offsetY);
        };
        
        internalRender = renderPlacing;
        internalUpdate = updatePlacing;
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
	// Handle mouse click
	//
	//------------------------------------------------------------------
	function processMouseClick(event) {
        if (grid.isPlacing()) {
            if (grid.isValid()) {
                towers.push(grid.endPlacement(true));
                
                internalUpdate = updatePlaying;
                internalRender = renderPlaying;
            }
        }
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
            graphics.drawTower(towers[i]);
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
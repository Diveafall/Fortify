
FORTIFY.model = (function(components, graphics, input) {
	var grid,
        towers = [],
        creeps = [],
        internalUpdate,
		internalRender,
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
        grid.beginPlacement(TowerType);
        
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
        for (var i = 0; i < towers.length; ++i) {
            towers[i].turn({ x: event.offsetX, y: event.offsetY });
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
        for (var i = 0; i < towers.length; ++i) {
            towers[i].update(elapsedTime);
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

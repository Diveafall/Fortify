
FORTIFY.model = (function(components, graphics, input) {
	var towers = [],
        creeps = [],
        internalUpdate,
		internalRender,
		keyboard = input.Keyboard();

	//------------------------------------------------------------------
	//
	// Prepares a newly initialized game model, ready for the start of
	// the game.
	//
	//------------------------------------------------------------------
	function initialize() {
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
	// Update the state of the game model based upon the passage of time.
	//
	//------------------------------------------------------------------
	function update(elapsedTime) {
		// internalUpdate(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// Render the current state of the game model.
	//
	//------------------------------------------------------------------
	function render() {
		// internalRender();
	}

	return {
		initialize: initialize,
		processInput: processInput,
		update: update,
		render: render
	};
} (FORTIFY.components, FORTIFY.graphics, FORTIFY.input));

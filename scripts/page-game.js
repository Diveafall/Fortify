/*global FORTIFY, console, KeyEvent, requestAnimationFrame, performance */

FORTIFY.pages['page-game'] = (function(gameModel, screens, graphics, input) {
	var cancelNextRequest = false,
		lastTimeStamp = performance.now();

	//------------------------------------------------------------------
	//
	// All one-time game page initialization is performed here.
	function initialize() {
		console.log('game initializing...');

		// keyboard.registerCommand({ key: KeyEvent.DOM_VK_ESCAPE }, function() {
		// 	//
		// 	// Stop the game loop by canceling the request for the next animation frame
		// 	cancelNextRequest = true;
		// 	//
		// 	// Then, return to the main menu
		// 	screens.showScreen('page-mainmenu');
		// });
	}
	
	function pause() {
		cancelNextRequest = true;
		screens.showScreen('page-mainmenu');
	}

	//------------------------------------------------------------------
	//
	// Input is procesed here.
	//
	//------------------------------------------------------------------
	function processInput(elapsedTime) {
		gameModel.processInput(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// The game model is updated here.
	//
	//------------------------------------------------------------------
	function update(elapsedTime) {
		gameModel.update(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// The game model is rendered here.
	//
	//------------------------------------------------------------------
	function render() {
		graphics.clear();
		gameModel.render();
	}

	//------------------------------------------------------------------
	//
	// This is the Game Loop function!
	//
	//------------------------------------------------------------------
	function gameLoop(time) {
		var elapsedTime = time - lastTimeStamp;

		processInput(elapsedTime);
		update(elapsedTime);
		lastTimeStamp = time;

		render();

		//
		// Cancel the next animation if the user has pressed the ESC key, returning them
		// to the main menu.
		if (!cancelNextRequest) {
			requestAnimationFrame(gameLoop);
		}
	}

	function run() {
		gameModel.initialize();
		lastTimeStamp = performance.now();
		//
		// Start the animation loop
		cancelNextRequest = false;
		requestAnimationFrame(gameLoop);
	}

	return {
		initialize : initialize,
		run : run,
		pause: pause
	};
} (FORTIFY.model, FORTIFY.screens, FORTIFY.graphics, FORTIFY.input));

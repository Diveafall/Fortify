/*global Brickout */

// ------------------------------------------------------------------
//
// This provides the code for screen management
//
// ------------------------------------------------------------------
FORTIFY.screens = (function(pages) {

	//------------------------------------------------------------------
	//
	// This function is used to change to a new active screen.
	//
	//------------------------------------------------------------------
	function showScreen(id) {
		var screen = 0,
			active = null;
		//
		// Remove the active state from all screens.  There should only be one...
		active = document.getElementsByClassName('active');
		for (screen = 0; screen < active.length; screen += 1) {
			active[screen].classList.remove('active');
		}
		//
		// Tell the screen to start actively running
		pages[id].run();
		//
		// Then, set the new screen to be active
		document.getElementById(id).classList.add('active');
	}

	//------------------------------------------------------------------
	//
	// This function performs the one-time game initialization.
	//
	//------------------------------------------------------------------
	function initialize() {
		var screen = null;
		//
		// Go through each of the screens and tell them to initialize
		for (screen in pages) {
			if (pages.hasOwnProperty(screen)) {
				pages[screen].initialize();
			}
		}

		//
		// Make the main-menu screen the active one
		showScreen('page-mainmenu');
	}

	return {
		initialize : initialize,
		showScreen : showScreen
	};
}(FORTIFY.pages));

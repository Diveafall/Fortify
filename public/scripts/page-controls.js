/*global Brickout */

FORTIFY.pages['page-controls'] = (function(screens) {
	
	var labelChanging = undefined,
		upgradeLabel = document.getElementById('upgrade'),
		sellLabel = document.getElementById('sell'),
		nextLevel = document.getElementById('nextlevel');
		
	function changeKey(label) {
		FORTIFY.input.Keyboard.prepareForSwitch(label);
	}

	function initialize() {
		document.getElementById('id-controls-back').addEventListener('click', function() { screens.showScreen('page-mainmenu'); });
		
		upgradeLabel.onclick = function(e) { changeKey(upgradeLabel); };
		sellLabel.onclick = function(e) { changeKey(sellLabel); };
		nextLevel.onclick = function(e) { changeKey(nextLevel); };
	}

	function run() {
		upgradeLabel.innerHTML = FORTIFY.Controls.getBindStringCommand('upgrade');
		sellLabel.innerHTML = FORTIFY.Controls.getBindStringCommand('sell');
		nextLevel.innerHTML = FORTIFY.Controls.getBindStringCommand('next-level');
	}

	return {
		initialize : initialize,
		run : run
	};
}(FORTIFY.screens));

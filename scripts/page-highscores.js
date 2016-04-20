/*global Brickout */

FORTIFY.pages['page-highscores'] = (function(screens) {

	function initialize() {
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() {
				screens.showScreen('page-mainmenu'); 
			});
	}

	function displayScores() {
		var highScores = FORTIFY.score.getHighscores(),
			highScoresHTML = document.getElementById('high-scores-list');

		//
		// Clear whatever was already in the display
		highScoresHTML.innerHTML = '';
		//
		// Grab the previously saved high scores and get them displayed
		highScores.forEach(function (score) {
			highScoresHTML.innerHTML += (score + '<br/>');
		});
	}

	function run() {
		displayScores();
	}

	return {
		initialize : initialize,
		run : run
	};
}(FORTIFY.screens));

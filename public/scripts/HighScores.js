/* global FORTIFY */

// ------------------------------------------------------------------
//
// High scores implementation.  Behind the abstraction localStorage is
// used for client-side persistence.
//
// ------------------------------------------------------------------
FORTIFY.HighScores = (function() {
	'use strict';
	var scores = [],
		previousScores = localStorage.getItem('FORTIFY.highScores');

	if (previousScores !== null) {
		scores = JSON.parse(previousScores);
	}

	function add(score) {
		scores.push(score);
		scores.sort(function(a, b) {
			if (a > b) {
				return -1;
			} else if (a < b) {
				return 1;
			}

			return 0;
		});

		//
		// Keep only the best five
		if (scores.length > 5) {
			scores = scores.slice(0, 5);
		}

		localStorage['Brickout.highScores'] = JSON.stringify(scores);
	}

	function get() {
		return scores;
	}

	return {
		add : add,
		get : get
	};
}());

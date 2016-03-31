
FORTIFY.components = (function() {

	//
	// Constants, as best as we can do them in JavaScript
	var Constants = {
		get PaddleHeight() { return 15; },
		get PaddleOffset() { return 5; },
		get PaddleWidthPercent() { return 10; },
		get BallSize() { return 15; },
		get BricksOffset() { return 50; },
		get BrickRows() { return 8; },
		get BricksPerRow() { return  14; },
		get BrickHeight() { return 15; },
		get BrickWidthPercent() { return 7; },
        get gridCellDimentions() { return { width: 5, height: 5 }; }
	};

	//------------------------------------------------------------------
	//
	// Tests to see if two rectangles intersect.  If they do, true is returned,
	// false otherwise.
	// Adapted from: http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
	//
	//------------------------------------------------------------------
	function intersectRectangles(r1, r2) {
		return !(
			r2.left > r1.right ||
			r2.right < r1.left ||
			r2.top > r1.bottom ||
			r2.bottom < r1.top
		);
	}
    
    //------------------------------------------------------------------
	//
	// Represents the main grid of the game. Helps place towers, and move creeps.
	//
	//------------------------------------------------------------------
    
	return {
		Constants: Constants
	};
}());

/*global CanvasRenderingContext2D, Brickout */

// ------------------------------------------------------------------
//
// This provides the rendering code for the game.
//
// ------------------------------------------------------------------
FORTIFY.graphics = (function() {

	var canvas = document.getElementById('canvas-main'),
		context = canvas.getContext('2d');

	//
	// Place a 'clear' function on the Canvas prototype, this makes it a part
	// of the canvas, rather than making a function that calls and does it.
	CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, canvas.width, canvas.height);
		this.restore();
	};

	//------------------------------------------------------------------
	//
	// Public method that allows the client code to clear the canvas.
	//
	//------------------------------------------------------------------
	function clear() {
		context.clear();
	}

	//------------------------------------------------------------------
	//
	// Draws a rectangle
	//
	//------------------------------------------------------------------
	function drawRectangle(spec) {
		context.fillStyle = spec.fill;
		context.fillRect(spec.x, spec.y, spec.width, spec.height);

        if (spec.stroke) {    
            context.strokeStyle = spec.stroke;
            context.strokeRect(spec.x, spec.y, spec.width, spec.height);
        }
	}

	//------------------------------------------------------------------
	//
	// Returns the width of the specified text, in pixels.
	//
	//------------------------------------------------------------------
	function measureTextWidth(spec) {
		context.save();

		context.font = spec.font;
		context.fillStyle = spec.fill;
		if (spec.hasOwnProperty('stroke')) {
			context.strokeStyle = spec.stroke;
		}
		var width = context.measureText(spec.text).width;

		context.restore();

		return width;
	}

	//------------------------------------------------------------------
	//
	// Returns the height of the specified text, in pixels.
	//
	//------------------------------------------------------------------
	function measureTextHeight(spec) {
		var saveText = spec.text;

		spec.text = 'm';	// Clever trick to get font height
		context.save();

		context.font = spec.font;
		context.fillStyle = spec.fill;
		if (spec.hasOwnProperty('stroke')) {
			context.strokeStyle = spec.stroke;
		}
		var width = context.measureText(spec.text).width;
		spec.text = saveText;

		context.restore();

		return width;
	}

	//------------------------------------------------------------------
	//
	// Draw some text to the screen
	//
	//------------------------------------------------------------------
	function drawText(spec) {
		context.save();

		context.font = spec.font,
		context.fillStyle = spec.fill;
		if (spec.hasOwnProperty('stroke')) {
			context.strokeStyle = spec.stroke;
		}
		context.textBaseline = 'top';

		context.fillText(spec.text, spec.position.x, spec.position.y);
		context.strokeText(spec.text, spec.position.x, spec.position.y);

		context.restore();
	}
    
    //------------------------------------------------------------------
	//
	// Draw tower
	//
	//------------------------------------------------------------------
	function drawTower(tower, a) {
        // Draw base
        if (a) {
            context.save();
        context.fillStyle = 'lightgrey';
        context.beginPath();
        context.arc(tower.center.x, tower.center.y, tower.shootRadius, 0, 2 * Math.PI);
        context.fill();
        context.restore();
        }
        
		// Draw base
        context.save();
        context.fillStyle = tower.baseColor;
        context.beginPath();
        context.arc(tower.center.x, tower.center.y, tower.radius, 0, 2 * Math.PI);
        context.fill();
        context.restore();
        
        // Draw cannon
        context.save();
        context.fillStyle = tower.cannonColor;
        context.fillRect(
            tower.center.x - tower.cannonWidth / 2,
            tower.center.y,
            tower.cannonWidth,
            tower.cannonLength
        );
        context.restore();
	}
    
    //------------------------------------------------------------------
	//
	// Draw creep
	//
	//------------------------------------------------------------------
	function drawCreep(creep) {
        context.save();
        context.fillStyle = creep.creepColor;
        context.beginPath();
        context.arc(creep.center.x, creep.center.y, creep.radius, 0, 2 * Math.PI);
        context.fill();
        context.restore();   
    }
    

    //------------------------------------------------------------------
	//
	// Return canvas frame
	//
	//------------------------------------------------------------------
    function canvasFrame() {
        return {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
        };
    }
    
	return {
		clear : clear,
        getCanvas: function() { return canvas; },
        getContext: function() { return context; },
        canvasFrame: canvasFrame,
		drawRectangle : drawRectangle,
		drawText: drawText,
        drawTower: drawTower,
        drawCreep: drawCreep,
		measureTextWidth: measureTextWidth,
		measureTextHeight: measureTextHeight
	};
}());

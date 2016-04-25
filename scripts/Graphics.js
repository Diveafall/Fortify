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

		context.font = spec.font;
		if (spec.hasOwnProperty('fill')) {
			context.fillStyle = spec.fill;
		}
		if (spec.hasOwnProperty('stroke')) {
			context.strokeStyle = spec.stroke;
		}
		context.textBaseline = 'middle';

		context.fillText(spec.text, spec.position.x, spec.position.y);
		context.strokeText(spec.text, spec.position.x, spec.position.y);

		context.restore();
	}
	
	function drawImage(spec) {
		context.save();
		
		context.translate(spec.center.x, spec.center.y);
		context.rotate(spec.rotation);
		context.translate(-spec.center.x, -spec.center.y);
		
		context.drawImage(
			spec.image, 
			spec.center.x - spec.size/2, 
			spec.center.y - spec.size/2,
			spec.size, spec.size);
		
		context.restore();
	}
    
    //------------------------------------------------------------------
	//
	// Draw tower
	//
	//------------------------------------------------------------------
	function drawTower(tower) {
        tower.render(context);
	}
    
    //------------------------------------------------------------------
	//
	// Draw a projectile
	//
	//------------------------------------------------------------------
	function drawProjectile(projectile) {
        context.save();
        
        // drawText({ font: 'Georgia, serif', fill: 'black', position: { x: 100, y: 100 }, text: projectile.rotation.toString() });
        
        context.translate(projectile.center.x, projectile.center.y);
        context.rotate(projectile.rotation);
        context.translate(-projectile.center.x, -projectile.center.y);
        
        context.fillStyle = projectile.color;
        context.fillRect(projectile.center.x + projectile.headStart, projectile.center.y - projectile.height / 2, projectile.width, projectile.height);
        
        if (projectile.strokeColor) {
            context.strokeStyle = projectile.strokeColor;
            context.strokeRect(projectile.center.x + projectile.headStart, projectile.center.y - projectile.height / 2, projectile.width, projectile.height);
        }
        
        context.restore();
	}
	
	//------------------------------------------------------------------
	//
	// Provides rendering support for a sprite animated from a sprite sheet.
	//
	//------------------------------------------------------------------
	function SpriteSheet(spec) {
		var that = {},
			image = new Image();

		//
		// Initialize the animation of the spritesheet
		spec.sprite = 0;		// Which sprite to start with
		spec.elapsedTime = 0;	// How much time has occured in the animation

		//
		// Load the image, set the ready flag once it is loaded so that
		// rendering can begin.
		image.onload = function() { 
			//
			// Our clever trick, replace the draw function once the image is loaded...no if statements!
			that.draw = function() {
				context.save();

				context.translate(spec.center.x, spec.center.y);
				context.rotate(spec.rotation);
				context.translate(-spec.center.x, -spec.center.y);

				//
				// Pick the selected sprite from the sprite sheet to render
				context.drawImage(
					image,
					spec.width * spec.sprite, 0,	// Which sprite to pick out
					spec.width, spec.height,		// The size of the sprite
					spec.center.x - spec.width * spec.scale/2,	// Where to draw the sprite
					spec.center.y - spec.height * spec.scale/2,
					spec.width * spec.scale, spec.height * spec.scale);

				context.restore();
			};
			//
			// Once the image is loaded, we can compute the height and width based upon
			// what we know of the image and the number of sprites in the sheet.
			spec.height = image.height;
			spec.width = image.width / spec.spriteCount;
		};
		image.src = spec.spriteSheet;

		//------------------------------------------------------------------
		//
		// Update the animation of the sprite based upon elapsed time.
		//
		//------------------------------------------------------------------
		that.update = function(elapsedTime, forward) {
			spec.elapsedTime += elapsedTime;
			//
			// Check to see if we should update the animation frame
			if (spec.elapsedTime >= spec.spriteTime[spec.sprite]) {
				//
				// When switching sprites, keep the leftover time because
				// it needs to be accounted for the next sprite animation frame.
				spec.elapsedTime -= spec.spriteTime[spec.sprite];
				//
				// Depending upon the direction of the animation...
				if (forward === true) {
					spec.sprite += 1;
					//
					// This provides wrap around from the last back to the first sprite
					spec.sprite = spec.sprite % spec.spriteCount;
				} else {
					spec.sprite -= 1;
					//
					// This provides wrap around from the first to the last sprite
					if (spec.sprite < 0) {
						spec.sprite = spec.spriteCount - 1;
					}
				}
			}
		};

		//------------------------------------------------------------------
		//
		// Render the correct sprint from the sprite sheet
		//
		//------------------------------------------------------------------
		that.draw = function() {
			//
			// Starts out empty, but gets replaced once the image is loaded!
		};

		return that;
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
		drawImage: drawImage,
        drawTower: drawTower,
        drawProjectile: drawProjectile,
		SpriteSheet: SpriteSheet,
		measureTextWidth: measureTextWidth,
		measureTextHeight: measureTextHeight
	};
}());

// Heavily modified sprite sheet animation for creep from class demo
FORTIFY.AnimatedModel = (function(graphics) {
    
    function AnimatedModel(spec) {
		var that = {},
			sprite = graphics.SpriteSheet(spec);	// We contain a SpriteSheet, not inherited from, big difference
            
        that.targetAngle = 0;
            
        // helper function: returns true if number is within range of the pivot
        function isWithinRange(num, pivot, range) {
            if (num >= pivot - range && num <= pivot + range) return true;
            return false;
        }
            
		that.update = function(elapsedTime) {
			sprite.update(elapsedTime);
            
            if (!isWithinRange(spec.rotation, that.targetAngle, 0.2)) {
                // find the distance between me and my target
                var delta = Math.abs(spec.rotation - that.targetAngle);
                // if my angle comes before target angle
                if (spec.rotation <= that.targetAngle) {
                    // if distance is less than PI go clockwise, otherwise: counterclockwise
                    spec.rotation += (delta > Math.PI ? -1 : 1) * spec.rotateRate * elapsedTime;
                } else {
                    // if distance is less than PI go counterclockwise, otherwise: clockwise
                    spec.rotation += (delta > Math.PI ? 1 : -1) * spec.rotateRate * elapsedTime;
                }
            }
            // if I'm in range of my target
            else {
                spec.rotation = that.targetAngle;
                return true;
            }
            
            // make sure we stay inside these bounds [0, 2 * PI]
            if (spec.rotation > 2 * Math.PI) spec.rotation = 0;
            if (spec.rotation < 0) spec.rotation += 2 * Math.PI;
            return false;
		};
		
		that.render = function() {
			sprite.draw();
		};
		
		that.rotateRight = function(elapsedTime) {
			spec.rotation += spec.rotateRate * (elapsedTime);
            if (spec.rotation > Math.PI * 2) {
                spec.rotation -= Math.PI * 2;
            }
		};
		
		that.rotateLeft = function(elapsedTime) {
			spec.rotation -= spec.rotateRate * (elapsedTime);
            if (spec.rotation < 0) {
                spec.rotation += Math.PI * 2;
            }
		};
		
		//------------------------------------------------------------------
		//
		// Move in the direction the sprite is facing
		//
		//------------------------------------------------------------------
		that.moveForward = function(elapsedTime) {
			//
			// Create a normalized direction vector
			var vectorX = Math.cos(spec.rotation + spec.orientation),
				vectorY = Math.sin(spec.rotation + spec.orientation);
			//
			// With the normalized direction vector, move the center of the sprite
			spec.center.x += (vectorX * spec.moveRate * elapsedTime);
			spec.center.y += (vectorY * spec.moveRate * elapsedTime);
		};
		
		//------------------------------------------------------------------
		//
		// Move in the negative direction the sprite is facing
		//
		//------------------------------------------------------------------
		that.moveBackward = function(elapsedTime) {
			//
			// Create a normalized direction vector
			var vectorX = Math.cos(spec.rotation + spec.orientation),
				vectorY = Math.sin(spec.rotation + spec.orientation);
			//
			// With the normalized direction vector, move the center of the sprite
			spec.center.x -= (vectorX * spec.moveRate * elapsedTime);
			spec.center.y -= (vectorY * spec.moveRate * elapsedTime);
		};
        
        that.updateCenter = function(x, y) {
            spec.center.x = x;
            spec.center.y = y;
        }
        
        that.updateTargetRotation = function(newRotation) {
            that.targetAngle = newRotation;
        }
        
        that.setRotation = function(newRotation) {
            spec.rotation = newRotation;
        }
		
		return that;
	}
    
    return {
        AnimatedModel: AnimatedModel
    }
}(FORTIFY.graphics));
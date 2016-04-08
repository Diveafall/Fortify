
FORTIFY.components = (function() {

	//
	// Constants, as best as we can do them in JavaScript
	var Constants = {
        get gridCellDimentions() { return { width: 15, height: 15 }; },
        get gridCellBorder() { return 1; },
        get gridAvailableCellColor() { return 'rgba(0, 255, 0, 1)'; },
        get gridUnavailableCellColor() { return 'rgba(255, 0, 0, 1)'; },
        get gridHighlightedCellColor() { return 'rgba(75, 0, 130, 1)'; },
        get gridUnavailableHighlightedColor() { return 'rgba(255, 0, 255, 1)'; }
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
    // spec must include
    //      frame: x, y, width, and height
	//
	//------------------------------------------------------------------
    function GameGrid(spec) {
        var that = FORTIFY.View(spec), 
            grid = [], 
            numberOfRows = that.height / Constants.gridCellDimentions.height,
            numberOfCols = that.width / Constants.gridCellDimentions.width,
            isPlacing = false,
            canPlace = true,
            currentSelection = {
                horizOffset: 0,
                vertiOffset: 0,
                selectedTower: {},
                highlightedCells: []
            },
            prevCenterLocation = loc(0, 0);
            
        console.log("Grid width: ", that.width, " Grid height: ", that.height);
        console.log("Number of rows: ", numberOfRows, " Number of columns: ", numberOfCols);
            
        for (var i = 0; i < numberOfRows; ++i) {
            grid[i] = [];
            for (var j = 0; j < numberOfCols; ++j) {
                grid[i][j] = (function() {
                    var available = true, 
                        highlighted = false,
                        pointOrigin = pointCoordFromLocation(i, j);
                        
                    return {
                        highlight: function() { highlighted = true; },
                        discount: function() { highlighted = false; },
                        occupy: function() { available = false; },
                        isAvailable: function() { return available; },
                        isHighlighted: function() { return highlighted; },
                        pointOrigin: pointOrigin
                    };
                })();
            }
        }
        
        function loc(row, col) {
            return {
                row: row,
                col: col
            };
        }
        
        function coord(x, y) {
            return {
                x: x,
                y: y
            }
        }
        
        // Return (row, col) location from (x,y) coordinate
        function gridLocationFromCoord(x, y) {
            var row = Math.floor((y / that.height) * numberOfRows);
            var col = Math.floor((x / that.width) * numberOfCols);
            
            return loc(row, col);
        }
        
        // Returns a Point object representing the origin of the grid cell
        function pointCoordFromLocation(row, col) {
            return FORTIFY.Point(j * Constants.gridCellDimentions.width, i * Constants.gridCellDimentions.height);
        }
        
        // Check if grid is open and valid at location
        function isValid(row, col) {
            return grid[row][col].object === undefined 
                && row < gridRows && col < gridCols;
        }
        
        // Makes highlighted cells no longer highlighted, empties the highlighted cell array
        function discountHighlightedCells() {
            for (var i = 0; i < currentSelection.highlightedCells.length; ++i) {
                currentSelection.highlightedCells[i].discount();
            }
            currentSelection.highlightedCells.length = 0;
        }
        
        // returns true if there are enough highlighted cells to add the tower
        function hasEnoughCells() {
            return currentSelection.highlightedCells.length === currentSelection.selectedTower.totalCells();
        }
        
        that.isPlacing = function() { return isPlacing; };
        
        // setting up tower placement 
        that.beginPlacement = function(tower) {
            if (!isPlacing) {
                isPlacing = true; // start placing
                currentSelection.selectedTower = tower; // initialize a tower of given type, store it
                // horiz and vertical offsets help highlight appropriate cells
                currentSelection.horizOffset = Math.floor(currentSelection.selectedTower.cellSize.horizCells / 2);
                currentSelection.vertiOffset = Math.floor(currentSelection.selectedTower.cellSize.vertiCells / 2);
            }
        }
        
        // finishing tower placement
        that.endPlacement = function(success) {
            if (isPlacing) {
                isPlacing = false; // end placing
                if (success) { // if success is true, then placing the tower is allowed
                    var addedTower = currentSelection.selectedTower; // remember the tower in order to return it later
                    for (var i = 0; i < currentSelection.highlightedCells.length; ++i) // highlighted cell are now officially occupied by a tower
                        currentSelection.highlightedCells[i].occupy();
                        
                    discountHighlightedCells(); // "unhighlight" highlighted cells
                    currentSelection.selectedTower = undefined; // remove tower from storage
                    currentSelection.highlightedCells.length = 0; // empty highlighted cells' array
                    return addedTower; // return that added tower
                    
                } else { // if success is false, then placement got canceled
                    currentSelection.highlightedCells.length = 0; // empty highlighted cells' array
                    currentSelection.selectedTower = undefined; // remove tower from storage
                }
            }
        }
        
        // returns true if tower placement is allowed
        that.isValid = function() {
            if (isPlacing) {
                if (currentSelection.selectedTower.totalCells() == currentSelection.highlightedCells.length && canPlace) {
                    return true;
                } else return false;
            }
            return false;
        }
        
        that.update = function(x, y) {
            if (isPlacing) {
                var location = gridLocationFromCoord(x, y); // finding location of the cell mouse is currently hovering over
                if (location.row === prevCenterLocation.row && location.col === prevCenterLocation.col) return; // don't update if the location hasn't changed
                
                discountHighlightedCells(); // "unhighlight" highlighted cells
                    
                for (var i = location.row - currentSelection.vertiOffset; i <= location.row + currentSelection.vertiOffset; ++i) {
                    for (var j = location.col - currentSelection.horizOffset; j <= location.col + currentSelection.horizOffset; ++j) {
                        if (i < 0 || j < 0 || i >= numberOfRows || j >= numberOfCols) {} else { // if i and j are valid
                            currentSelection.highlightedCells.push(grid[i][j]); // push cell to highlighted list
                            grid[i][j].highlight(); // highlight the cell
                        }
                    }
                }
                
                currentSelection.selectedTower.origin = currentSelection.highlightedCells[0].pointOrigin; // update tower origin
            }
        };
        
        that.render = function(graphics) {
            if (isPlacing) {
                var context = graphics.getContext();
                context.save();
                context.globalAlpha = 0.5;
                canPlace = true;
                for (var i = 0; i < numberOfRows; ++i) {
                    for (var j = 0; j < numberOfCols; ++j) {
                        graphics.drawRectangle({
                            x: grid[i][j].pointOrigin.x,
                            y: grid[i][j].pointOrigin.y,
                            width: Constants.gridCellDimentions.width,
                            height: Constants.gridCellDimentions.height,
                            fill: (function() { // this function returns the appropriate color for the cell
                                if (grid[i][j].isHighlighted()) {
                                    if (!grid[i][j].isAvailable() || !hasEnoughCells()) {
                                        canPlace = false;
                                        return Constants.gridUnavailableHighlightedColor;
                                    }
                                    return Constants.gridHighlightedCellColor;
                                } else if (grid[i][j].isAvailable()) {
                                    return Constants.gridAvailableCellColor;
                                }
                                return Constants.gridUnavailableCellColor;
                            })(),
                            stroke: 'grey'
                        });
                    }
                }
                
                if (canPlace) graphics.drawTower(currentSelection.selectedTower, true);
                context.restore();
            }
        };
        
        return that;
    }
    
    //------------------------------------------------------------------
	//
	// Represents a generic tower
    // spec must include
    //      frame: x, y, width, and height
    //      radius: number
    //      cellSize: Object containing vertical and horizontal number of cells this tower requires
	//
	//------------------------------------------------------------------
    function Tower(spec) {
        var that = FORTIFY.View(spec), fireTimer = 0, currentTarget = undefined;
        
        that.baseColor = '#808080';
        that.cannonColor = '#000000';
        
        that.cannonLength = that.height * 0.5;
        that.cannonWidth = that.width * 0.1;
        
        that.cellSize = spec.cellSize;
        that.radius = that.height / 3;
        
        // rotation
        that.angle = 0;
        that.targetAngle = 0;
        that.rotationSpeed = 2 * Math.PI / 1000; // one rotation per second
        
        // firing
        that.shootRadius = that.height * 2;
        that.shootRate = 1000 / 5; // once per second
        that.fire = function() {
            
            var newProjectile = spec.Projectile({
                rotation: that.angle, // current angle of the tower
                moveRate: 300 / 1000, // pixels per second
                containerFrame: that.containerFrame, // projectile can see the frame it's in
                frame: {
                    x: 0,
                    y: 0,
                    width: that.width * 0.3,
                    height: that.cannonWidth
                }
            });
            
            newProjectile.center = that.center;
            newProjectile.setTarget && newProjectile.setTarget(currentTarget);
            
            spec.projectiles.push(newProjectile);
        };
        
        // helper function: returns true if number is within range of the pivot
        function isWithinRange(num, pivot, range) {
            if (num >= pivot - range && num <= pivot + range) return true;
            return false;
        }
        
        // return the total number of cells required for this tower
        that.totalCells = function() { return spec.cellSize.horizCells * spec.cellSize.vertiCells; };
        
        // set target angle to angle between my center and given point
        that.turn = function(point) {
            that.targetAngle = that.center.angle(point);
            if (that.shootRadius > that.center.distance(point)) {
                currentTarget = point;
            } else {
                currentTarget = undefined;
            }
        }
        
        that.update = function(elapsedTime) {
            // HANDLING ROTATION
            // if I'm not within specific range of my target
            if (!isWithinRange(that.angle, that.targetAngle, 0.4)) {
                // find the distance between me and my target
                var delta = Math.abs(that.angle - that.targetAngle);
                // if my angle comes before target angle
                if (that.angle <= that.targetAngle) {
                    // if distance is less than PI go clockwise, otherwise: counterclockwise
                    that.angle += (delta > Math.PI ? -1 : 1) * that.rotationSpeed * elapsedTime;
                } else {
                    // if distance is less than PI go counterclockwise, otherwise: clockwise
                    that.angle += (delta > Math.PI ? 1 : -1) * that.rotationSpeed * elapsedTime;
                }
            }
            // if I'm in range of my target
            else {
                that.angle = that.targetAngle;
                if (currentTarget) {
                    // HANDLING THE FIRING
                    fireTimer += elapsedTime;
                    if (fireTimer >= that.shootRate) { // time to shoot
                        that.fire(); // FIRE!
                        fireTimer = 0; // reset timer
                    }
                }
            }
            
            // make sure we stay inside these bounds [0, 2 * PI]
            if (that.angle > 2 * Math.PI) that.angle = 0;
            if (that.angle < 0) that.angle += 2 * Math.PI;
        };
        
        return that;
    }
    
    function GenericTower(spec) {
        var horizCells = 3, vertiCells = 3, width = horizCells * Constants.gridCellDimentions.width, height = vertiCells * Constants.gridCellDimentions.height;
        return Tower({ 
            cellSize: { horizCells: horizCells, vertiCells: vertiCells }, 
            frame: { x: -width, y: -height, width: width, height: height },
            projectiles: spec.projectiles,
            containerFrame: spec.containerFrame,
            Projectile: Projectile
        });
    }
    
    function MissileTower(spec) {
        var horizCells = 3, vertiCells = 3, width = horizCells * Constants.gridCellDimentions.width, height = vertiCells * Constants.gridCellDimentions.height;
        return Tower({ 
            cellSize: { horizCells: horizCells, vertiCells: vertiCells }, 
            frame: { x: -width, y: -height, width: width, height: height },
            projectiles: spec.projectiles,
            containerFrame: spec.containerFrame, 
            Projectile: GuidedProjectile
        });
    }

    /**
     * Creates an instance of Projectile
     * 
     * @constructor
     * @this {Projectile}
     * @param {Object} spec Must include: frame, rotation, moveRate 
     */
    function Projectile(spec) {
        var that = FORTIFY.View(spec);
        
        that.headStart = 10;
        that.color = 'rgba(254, 253, 227, 1)';
        that.strokeColor = 'rgba(112, 246, 90, 1)';
        that.rotation = spec.rotation;
        
        Object.defineProperty(that, 'rotation', {
            get: function() { return spec.rotation; }
        });
        
        Object.defineProperty(that, 'moveRate', {
            get: function() { return spec.moveRate; }
        });
        
        that.isWithinBounds = function() {
            if (that.center.x < 0 ||
                that.center.y < 0 ||
                that.frame.right > that.containerFrame.right ||
                that.frame.bottom > that.containerFrame.bottom) {
                    
                console.log('projectile out of bounds');
                
                return false;
            }
            return true;
        };
        
        that.update = function(elapsedTime) {
            var vectorX = Math.cos(that.rotation), vectorY = Math.sin(that.rotation);
            that.center = that.center.add({ x: vectorX * spec.moveRate * elapsedTime, y: vectorY * spec.moveRate * elapsedTime });
        };

        return that;        
    }    
    
    function GuidedProjectile(spec) {
        var that = Projectile(spec), currentTarget = undefined,
            base = {
                update: that.update
            };
            
        that.setTarget = function(target) {
            currentTarget = target;
        };
            
        that.update = function(elapsedTime) {
            if (currentTarget) {
                that.rotation = that.center.angle(currentTarget);
                console.log("Current rotation: ", that.rotation, "Current target: x - ", currentTarget.x, "y - ", currentTarget.y);
                console.log("My center: ", that.center.x, that.center.y);
            }
            // var vectorX = Math.cos(that.rotation), vectorY = Math.sin(that.rotation);
            // that.center = that.center.add({ x: vectorX * spec.moveRate * elapsedTime, y: vectorY * spec.moveRate * elapsedTime });
            base.update(elapsedTime);
        };
        
        return that;
    };
    
	return {
		Constants: Constants,
        GameGrid: GameGrid,
        GenericTower: GenericTower,
        MissileTower: MissileTower
	};
}());

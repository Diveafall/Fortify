
FORTIFY.components = (function(Creep, AnimatedModel) {

	//
	// Constants, as best as we can do them in JavaScript
	var Constants = {
        get gridCellDimentions() { return { width: 15, height: 15 }; },
        get gridCellBorder() { return 1; },
        get gridAvailableCellColor() { return 'rgba(173, 216, 230, 1)'; },
        get gridUnavailableCellColor() { return 'rgba(255, 0, 0, 1)'; },
        get gridHighlightedCellColor() { return 'rgba(75, 0, 130, 1)'; },
        get gridUnavailableHighlightedColor() { return 'rgba(255, 0, 255, 1)'; }
	};
    
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
                        visited = false;
                        pointOrigin = pointCoordFromLocation(i, j);
                        
                    return {
                        highlight: function() { highlighted = true; },
                        discount: function() { highlighted = false; },
                        occupy: function() { available = false; },
                        vacant: function() { available = true; },
                        visited: function() { visited = true; },
                        resetVisited: function() { visited = false; },
                        isAvailable: function() { return available; },
                        isHighlighted: function() { return highlighted; },
                        isVisited: function() { return visited; },
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
        
        that.numberOfCols = numberOfCols;
        that.numberOfRows = numberOfRows;
        that.getGridCopy = function() { return FORTIFY.Util.resetGridVisited(grid); };
        
        // Possible spawn locations
        var left = loc(Math.floor(numberOfRows/2), 0),
            right = loc(Math.floor(numberOfRows/2), numberOfCols-1),
            top = loc(0, Math.floor(numberOfCols/2)),
            bottom = loc(numberOfRows-1, Math.floor(numberOfCols/2));

        // Pass in number between 0-3 (inclusive) to get a path for creeps
        // 0: l->r, 1: r->l, 2: t->b, 3: b->t
        that.getCreepPath = function(pathNumber) {
            var that = {};
            
            if (pathNumber === 0) {
                that.spawnLoc = left;
                that.endLoc = right;
            } else if (pathNumber === 1) {
                that.spawnLoc = right;
                that.endLoc = left;
            } else if (pathNumber === 2) {
                that.spawnLoc = top;
                that.endLoc = bottom;
            } else {
                that.spawnLoc = bottom;
                that.endLoc = top;
            }
            
            return that;
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
        
        // returns true if currently placing a tower
        that.isPlacing = function() { return isPlacing; };
        
        // return grid cell at location
        that.cellAtLocation = function(location) {
            return grid[location.row][location.col];
        };
        
        // setting up tower placement 
        that.beginPlacement = function(tower) {
            if (isPlacing) that.endPlacement(false);
            isPlacing = true; // start placing
            currentSelection.selectedTower = tower; // initialize a tower of given type, store it
            // horiz and vertical offsets help highlight appropriate cells
            currentSelection.horizOffset = Math.floor(currentSelection.selectedTower.cellSize.horizCells / 2);
            currentSelection.vertiOffset = Math.floor(currentSelection.selectedTower.cellSize.vertiCells / 2);
        }
        
        // finishing tower placement
        that.endPlacement = function(success) {
            if (isPlacing) {
                isPlacing = false; // end placing
                if (success) { // if success is true, then placing the tower is allowed
                    var addedTower = currentSelection.selectedTower; // remember the tower in order to return it later
                    for (var i = 0; i < currentSelection.highlightedCells.length; ++i) // highlighted cell are now officially occupied by a tower
                        currentSelection.highlightedCells[i].occupy();
                        
                    // tower now knows the cells it's occupying
                    addedTower.occupiedCells = currentSelection.highlightedCells.slice();
                        
                    discountHighlightedCells(); // "unhighlight" highlighted cells
                    currentSelection.selectedTower = undefined; // remove tower from storage
                    currentSelection.highlightedCells.length = 0; // empty highlighted cells' array
                    return addedTower; // return that added tower
                    
                } else { // if success is false, then placement got canceled
                    discountHighlightedCells();
                    currentSelection.highlightedCells.length = 0; // empty highlighted cells' array
                    currentSelection.selectedTower = undefined; // remove tower from storage
                }
            }
        }
        
        // removes tower from grid
        that.removeTowerFromGrid = function(tower) {
            for (var i = 0; i < tower.occupiedCells.length; ++i) {
                tower.occupiedCells[i].vacant();
            }
        };
        
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
        
        that.rotation = spec.rotation;
        that.moveRate = 400 / 1000; // pixels per second
        
        Object.defineProperty(that, 'damage', {
            get: function() { return spec.damage; }
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
            that.center = that.center.add({ x: vectorX * that.moveRate * elapsedTime, y: vectorY * that.moveRate * elapsedTime });
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
        
        that.moveRate = 200 / 1000; // pixels per second
            
        that.update = function(elapsedTime) {
            if (currentTarget && !currentTarget.isDead()) {
                that.rotation = that.center.angle(currentTarget.center);
            }
            base.update(elapsedTime);
        };
        
        return that;
    };
    
	return {
		Constants: Constants,
        GameGrid: GameGrid,
        Creep: Creep.Creep,
        Projectile: Projectile,
        GuidedProjectile: GuidedProjectile
	};
}(FORTIFY.Creep));


FORTIFY.Creep = (function(Util, AnimatedModel) {
    
    var CREEPTYPE = { GROUND: 0, GROUND2: 1, AIR: 2 };
    
    var Constants = {
        get creepCellSize() { return 0.75; },
        get creepHealth() { return 100; },
        get creepSpeed() { return 0.04; },
        get creepSpeedPerLevel() { return 0.005; },
        get creepPoints() { return 20; },
        get creepPointsPerLevel() { return 10; },
        get airType() { return 2; }
    }
    
    var spriteSheetImages = [
      "assets/creep1-blue.png",
      "assets/creep2-red.png",
      "assets/creep3-green.png"
    ],
    spriteSheetImageCounts = [6, 4, 4],
    spriteSheetTimings = [
      [1000, 200, 100, 1000, 100, 200],
      [200, 1000, 200, 600],
      [1000, 200, 200, 200]  
    ];
    
    // Check if cell is open
    function isPath(cell, isFlyer) {
        return (cell.isAvailable() || isFlyer) && !cell.isVisited();
    }

    // Check for accessible paths from cell
    function pathsForCell(cell, grid, isFlyer) {
        var paths = [];
        
        if (cell.row > 0 && isPath(grid[cell.row - 1][cell.col], isFlyer)) {
            paths.push(Util.loc(cell.row - 1, cell.col));
        }
        if (cell.row < grid.length - 1 && isPath(grid[cell.row + 1][cell.col], isFlyer)) {
            paths.push(Util.loc(cell.row + 1, cell.col));
        }
        if (cell.col > 0 && isPath(grid[cell.row][cell.col-1], isFlyer)) {
            paths.push(Util.loc(cell.row, cell.col - 1));
        }
        if (cell.col < grid.length - 1 && isPath(grid[cell.row][cell.col+1], isFlyer)) {
            paths.push(Util.loc(cell.row, cell.col + 1));
        }

        return paths;
    }
    
    // Check if array already contains a given location
    function alreadyVisited(loc, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].row === loc.row && array[i].col === loc.col) {
                return true;
            }
        }
        return false;
    }
    
    var count = 0;
    // Find shortest path in grid to goal
    function shortestPath(grid, startLoc, endLoc, isFlyer = false) {
        //var startLoc = findStart(myMaze);
        count = 0;

        grid[startLoc.row][startLoc.col].visited();
        var queue = [[startLoc]];
        var shortestPath = null;
        var i;
        while (queue.length > 0) {
            // dequeue
            var path = queue.shift();

            // check if is end
            var curr = path[path.length - 1];
            if(curr.row === endLoc.row && curr.col === endLoc.col) {
                shortestPath = path;
                break;
            }
            count++;

            // queue next possibilities
            var nextSteps = pathsForCell(curr, grid, isFlyer);
            for (i = 0; i < nextSteps.length; i++) {
                if(!alreadyVisited(nextSteps[i], path)) {
                    var pathCopy = path.slice();
                    pathCopy.push(nextSteps[i]);
                    queue.push(pathCopy);
                    grid[nextSteps[i].row][nextSteps[i].col].visited();
                }
            }
        }
        // Give XY coordinates for each step on path
        if (shortestPath != null) {
            for (i = 0; i < shortestPath.length; i++) {
                var curr = shortestPath[i];
                var xyForCell = Util.pointCoordFromLocation(curr.row, curr.col);
                
                shortestPath[i].x = xyForCell.x;
                shortestPath[i].y = xyForCell.y;
            }
        }

        return shortestPath;
    }

    // Next step to take to solve the maze
    function nextStep(grid, startLoc, endLoc) {
        var path = shortestPath(grid, startLoc, endLoc);

        if(path.length > 1) {
            return path[1];
        } else {
            return path[0];
        }
    }
    
    // Create new creep
    // If whichPath is not specified, generate a random direction to move (default)
    function Creep(spec) {
        var sizeSpec = { cellSize: { horizCells: Constants.creepCellSize, vertiCells: Constants.creepCellSize } },
            health = Constants.creepHealth,
            path = [],
            currCell = {},
            myPath = spec.grid.getCreepPath(spec.whichPath),
            spawnLoc = myPath.spawnLoc,
            endLoc = myPath.endLoc,
            dead = false,
            reachedEnd = false,
            isFirstUpdate = true,
            effects = [];
        
        var animationSpec = {
			spriteSheet : spriteSheetImages[spec.type],
			spriteCount : spriteSheetImageCounts[spec.type],
			spriteTime : spriteSheetTimings[spec.type],	// milliseconds per sprite animation frame
			center : { x : 23, y : 23 },
            scale : 0.5,
			rotation : 0,
			orientation : 0,				// Sprite orientation with respect to "forward"
			moveRate : 200 / 1000,// (IGNORED)			// pixels per millisecond
			rotateRate : 3.14159 / 1000 // (IGNORED)		// Radians per millisecond
		};
        var myModel = AnimatedModel.AnimatedModel(animationSpec);

        sizeSpec.frame = {
            x: 0, y: 0, 
            width: sizeSpec.cellSize.horizCells * FORTIFY.Constants.gridCellDimensions.width, 
            height: sizeSpec.cellSize.vertiCells * FORTIFY.Constants.gridCellDimensions.height
        }
        
        var that = FORTIFY.View(sizeSpec);
        
        // Size values for creep
        that.cellSize = sizeSpec.cellSize;
        that.radius = that.height / 2;
        that.center = Util.pointCoordFromLocation(spawnLoc.row, spawnLoc.col);
        that.type = spec.type;
        that.points = (function() {
            var points = Constants.creepPoints + (Constants.creepPointsPerLevel * spec.level);
            
            // Give more points if it is a flyer
            if (spec.type === Constants.airType) {
                points *= 1.5;
            }
            return points;
        })();
        that.gold = (function() {
            return Math.floor(that.points * 0.1);
        })();
        
        // return the total number of cells required for this creep
        that.totalCells = function() { return sizeSpec.cellSize.horizCells * sizeSpec.cellSize.vertiCells; };
        
        // Distance formula
        var calcDistance = function(x1, x2, y1, y2) {
            return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
        }
        
        function vacateLocation() {
            if (path.length > 0 && spec.type !== Constants.airType) {
                spec.grid.cellAtLocation(path[0]).vacant();
            }
        }
        
        // Take damage from projectile
        that.takeDamage = function(damage) {
            health -= damage;
            if (health <= 0) {
                dead = true;
                vacateLocation();
            }
        }
        
        // returns true if dead, false otherwise
        that.isDead = function() {
            return dead;
        };
        
        that.healthPercentage = function() {
            var pct = health / Constants.creepHealth;
            if (pct < 0) {
                pct = 0;
            }
            return pct;
        }
        
        that.reachedEnd = function() {
            return reachedEnd;
        }
        
        // Only called on init and when tower is placed
        // return true or false based on if we stil have a path
        that.updatePath = function(currGrid) {
            vacateLocation();
            var gridCopy = currGrid.getGridCopy();
            var currCell = Util.gridLocationFromCoord(that.center.x, that.center.y);
            
            // Find a new path, flying creep types can bypass all towers
            var newPath = shortestPath(gridCopy, currCell, endLoc, spec.type === 2);
            
            if (newPath != null) {
                path = newPath;
                return true;
            } else {
                return false;
            }
        }
        that.updatePath(spec.grid);
        
        // Check if we have entered the target cell
        var didEnterNextCell = function(nextCell) {
            var currGridLoc = Util.gridLocationFromCoord(that.center.x, that.center.y);
            return currGridLoc.row == nextCell.row && currGridLoc.col == nextCell.col;
        }
        
        // set target angle to angle between my center and given point
        that.turn = function(point) {
            //console.log(point);
            var targetAngle = that.center.angle(point);
            console.log(targetAngle);
            // if (that.shootRadius > that.center.distance(point)) {
            //     currentTarget = point;
            // } else {
            //     currentTarget = undefined;
            // }
        }
        
        // apply effect to creep
        that.applyEffect = function(effect) {
            if (effect) effects.push(effect);
        };
                
        that.update = function(elapsedTime) {
            // Steps for updating: 
            // 1. Check if we have moved to a new cell
            // 2. If we have moved, remove current cell as target and switch to next
            if (reachedEnd || dead || path.length < 1) {
                return true;
            }
            
            var updateStats = {
                moveDistance: 0
            };
            
            var nextCell = path[0];
            
            if (didEnterNextCell(nextCell)) { // entered new cell
                if (spec.type !== Constants.airType) {
                    spec.grid.cellAtLocation(nextCell).vacant();
                }
                path.shift();
                if (path.length === 0) {
                    reachedEnd = true;
                    return true;
                }
                nextCell = path[0];
                if (spec.type !== Constants.airType) {
                    spec.grid.cellAtLocation(nextCell).occupy();
                }
            }
            
            // Direction to move
            var moveVector = {x: nextCell.x - that.center.x, y: nextCell.y - that.center.y};
            
            // Scale distance so we move a constant amount
            var creepMoveSpeed = Constants.creepSpeed + (Constants.creepSpeedPerLevel * spec.level);
            // Slow down creep if it is a flyer
            if (spec.type === Constants.airType) {
                creepMoveSpeed *= 0.75;
            }
            updateStats.moveDistance = creepMoveSpeed * elapsedTime;
            
            // APPLY EFFECTS
            for (var i = effects.length - 1; i >= 0; --i) {
                effects[i].update(elapsedTime);
                if (effects[i].hasExpired()) {
                    effects.splice(i, 1);
                } else {
                    effects[i].affect(updateStats);
                }
            }
            
            var remainingDistance = calcDistance(moveVector.x, 0, moveVector.y, 0);
            var moveRatio = updateStats.moveDistance / remainingDistance;
            
            // Actual distance to move
            var actualMoveVector = {x: moveVector.x * moveRatio, y: moveVector.y * moveRatio};
            
            // Update location
            var newCenter = FORTIFY.Point(that.center.x + actualMoveVector.x, that.center.y + actualMoveVector.y);
            
            // Update location for creep model
            var newAngle = newCenter.angle(FORTIFY.Point(nextCell.x, nextCell.y));
            myModel.updateTargetRotation(newAngle);
            
            // Update angle instantly if is first update
            if (isFirstUpdate) {
                isFirstUpdate = false;
                myModel.setRotation(newAngle);
            }
            
            // If rotated enough, move forward
            if (myModel.update(elapsedTime)) {
                that.center = FORTIFY.Point(newCenter.x, newCenter.y);
                myModel.updateCenter(that.center.x, that.center.y);
            }
            
            return false;
        }
        
        that.render = function(graphics) {
            // Render the actual animated sprite
            myModel.render();
            
            // Draw the health bar
            var context = graphics.getContext();
            context.save();
            context.strokeStyle = 'black';
            context.fillStyle = 'green';
            if (that.healthPercentage() < 0.5) {
                context.fillStyle = 'red';
            }
            var barHeight = that.height / 3;
            context.strokeRect(that.origin.x, that.origin.y - (barHeight * 3), that.width, barHeight);
            context.fillRect(that.origin.x, that.origin.y - (barHeight * 3), that.width * that.healthPercentage(), barHeight);
            context.restore();
        }
        
        return that;
    }
    
    
    // Spec must include:
    // grid - the grid it is working with
    // level - current level of game (determines speed, health)
    
    // Spec can also include: 
    // type - 0: ground1, 1: ground2, 2: air
    // whichPath - 0-3 to determine which direction the creep will travel
    function createCreep(spec) {
        if (!spec.hasOwnProperty('type')) {
            spec.type = Math.floor(Math.random() * 3);
        }
        if (!spec.hasOwnProperty('whichPath')) {
            spec.whichPath = Math.floor(Math.random() * 4);
        }
        
        return Creep(spec);
    }
    
    return {
        createCreep: createCreep,
        CREEPTYPE: CREEPTYPE
    }
})(FORTIFY.Util, FORTIFY.AnimatedModel);

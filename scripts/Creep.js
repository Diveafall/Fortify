
FORTIFY.Creep = (function(Util) {
    
    var Constants = {
        get creepCellSize() { return 0.75; },
        get creepHealth() { return 100; },
        get creepColor() { return "#0000FF"; },
        get creepSpeed() { return 0.05; }
    }
    
    // Check if cell is open
    function isPath(cell) {
        return cell.isAvailable() && !cell.isVisited();
    }

    // Check for accessible paths from cell
    function pathsForCell(cell, grid) {
        var paths = [];
        
        if (cell.row > 0 && isPath(grid[cell.row - 1][cell.col])) {
            paths.push(Util.loc(cell.row - 1, cell.col));
        }
        if (cell.row < grid.length - 1 && isPath(grid[cell.row + 1][cell.col])) {
            paths.push(Util.loc(cell.row + 1, cell.col));
        }
        if (cell.col > 0 && isPath(grid[cell.row][cell.col-1])) {
            paths.push(Util.loc(cell.row, cell.col - 1));
        }
        if (cell.col < grid.length - 1 && isPath(grid[cell.row][cell.col+1])) {
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
    function shortestPath(grid, startLoc, endLoc) {
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
            var nextSteps = pathsForCell(curr, grid);
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
    function Creep(grid) {
        var spec = { cellSize: { horizCells: Constants.creepCellSize, vertiCells: Constants.creepCellSize } },
            health = Constants.creepHealth,
            path = [],
            currCell = {},
            myPath = grid.getCreepPath(),
            spawnLoc = myPath.spawnLoc,
            endLoc = myPath.endLoc,
            dead = false,
            reachedEnd = false,
            isSlowed = false;

        spec.frame = {
            x: 0, y: 0, 
            width: spec.cellSize.horizCells * FORTIFY.Constants.gridCellDimensions.width, 
            height: spec.cellSize.vertiCells * FORTIFY.Constants.gridCellDimensions.height
        }
        
        var that = FORTIFY.View(spec);
        
        // Size values for creep
        that.creepColor = Constants.creepColor;
        that.cellSize = spec.cellSize;
        that.radius = that.height / 2;
        that.center = Util.pointCoordFromLocation(spawnLoc.row, spawnLoc.col);
        
        // return the total number of cells required for this creep
        that.totalCells = function() { return spec.cellSize.horizCells * spec.cellSize.vertiCells; };
        
        // Distance formula
        var calcDistance = function(x1, x2, y1, y2) {
            return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
        }
        
        // Take damage from projectile
        that.takeDamage = function(damage) {
            health -= damage;
            if (health <= 0) {
                dead = true;
            }
        }
        
        // returns true if dead, false otherwise
        that.isDead = function() {
            return dead;
        };
        
        that.slowCreep = function() {
            isSlowed = true;
        }
        
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
            var gridCopy = currGrid.getGridCopy();
            var currCell = Util.gridLocationFromCoord(that.center.x, that.center.y);
            
            var newPath = shortestPath(gridCopy, currCell, endLoc);
            if (newPath != null) {
                path = newPath;
                return true;
            } else {
                return false;
            }
        }
        
        that.updatePath(grid);
        
        // Check if we have entered the target cell
        var didEnterNextCell = function(nextCell) {
            var currGridLoc = Util.gridLocationFromCoord(that.center.x, that.center.y);
            
            return currGridLoc.row == nextCell.row && currGridLoc.col == nextCell.col;
        }
                
        that.update = function(elapsedTime) {
            // Steps for updating: 
            // 1. Check if we have moved to a new cell
            // 2. If we have moved, remove current cell as target and switch to next
            if (reachedEnd || dead) {
                return true;
            }
            var nextCell = path[0];
            if (didEnterNextCell(nextCell)) {
                path.shift();
                if (path.length === 0) {
                    reachedEnd = true;
                    return true;
                }
                nextCell = path[0];
            }
            
            // Direction to move
            var moveVector = {x: nextCell.x - that.center.x, y: nextCell.y - that.center.y};
            
            // Scale distance so we move a constant amount
            var updateMoveDistance = Constants.creepSpeed * elapsedTime;
            if (isSlowed) {
                updateMoveDistance *= 0.5;
            }
            var remainingDistance = calcDistance(moveVector.x, 0, moveVector.y, 0);
            var moveRatio = updateMoveDistance / remainingDistance;
            
            // Actual distance to move
            var actualMoveVector = {x: moveVector.x * moveRatio, y: moveVector.y * moveRatio};
            
            // Update location
            that.center = {x: that.center.x + actualMoveVector.x, y: that.center.y + actualMoveVector.y};
            return false;
        }
        
        return that;
    }
    
    return {
        Creep: Creep
    }
})(FORTIFY.Util);

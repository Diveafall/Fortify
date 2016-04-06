
FORTIFY.Creep = (function(Util) {
    
    // Check if cell is open
    function isPath(cell) {
        return cell.isAvailable();
    }

    // Check for accessible paths from cell
    function pathsForCell(cell, maze) {
        var paths = [];

        if (isPath(maze[cell.r - 1][cell.c])) {
            paths.push(Util.loc(cell.r - 1, cell.c));
        }
        if (isPath(maze[cell.r + 1][cell.c])) {
            paths.push(Util.loc(cell.r + 1, cell.c));
        }
        if (isPath(maze[cell.r][cell.c-1])) {
            paths.push(Util.loc(cell.r, cell.c - 1));
        }
        if (isPath(maze[cell.r][cell.c+1])) {
            paths.push(Util.loc(cell.r, cell.c + 1));
        }

        return paths;
    }
    
    // Check if array already contains a given location
    function alreadyVisited(loc, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].r === loc.r && array[i].c === loc.c) {
                return true;
            }
        }
        return false;
    }
    
    // Find shortest path in grid to goal
    function shortestPath(grid, startLoc, endLoc) {
        //var startLoc = findStart(myMaze);

        var queue = [[startLoc]];
        var shortestPath = null;
        var i;
        while (queue.length > 0) {
            // dequeue
            var path = queue.shift();

            // check if is end
            var curr = path[path.length - 1];
            if(curr.r === endLoc.r && curr.c === endLoc.c) {
                shortestPath = path;
                break;
            }

            // queue next possibilities
            var nextSteps = pathsForCell(curr, myMaze);
            for (i = 0; i < nextSteps.length; i++) {
                if(!alreadyVisited(nextSteps[i], path)) {
                    var pathCopy = path.slice();
                    pathCopy.push(nextSteps[i]);
                    queue.push(pathCopy);
                }
            }
        }

        return shortestPath;
    }

    // Next step to take to solve the maze
    function nextStep(myMaze, startLoc, endLoc) {
        var path = shortestPath(myMaze, startLoc);

        if(path.length > 1) {
            return path[1];
        } else {
            return path[0];
        }
    }
    
    // Create new creep
    function Creep(startLoc, endLoc) {
        var spec = { cellSize: { horizCells: 0.5, vertiCells: 0.5 } };
        spec.frame = {
            x: 0, y: 0, 
            width: spec.cellSize.horizCells * FORTIFY.Constants.gridCellDimensions.width, 
            height: spec.cellSize.vertiCells * FORTIFY.Constants.gridCellDimensions.height
        }
        
        var that = FORTIFY.View(spec);
        
        that.creepColor = '#00FF00';
        
        that.cellSize = spec.cellSize;
        that.radius = that.height;
        
        that.currDestLoc = endLoc
        that.currDest = Util.pointCoordFromLocation(endLoc.r, endLoc.c);
        
        // return the total number of cells required for this tower
        that.totalCells = function() { return spec.cellSize.horizCells * spec.cellSize.vertiCells; };
        
        // distance formula
        var calcDistance = function(x1, x2, y1, y2) {
            return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
        }
        
        that.update = function(elapsedTime, currGrid) {
            // Steps for updating (TODO): 
            // 1. Check if current destination cell is still open, if it is try to move there
            // 2. If not available or no current cell, do shortest path and find next cell
            
            // Direction to move
            var moveVector = {x: that.currDest.x - that.origin.x, y: that.currDest.y - that.origin.y};
            
            // Scale distance so we move a constant amount
            var updateMoveDistance = 0.05 * elapsedTime;
            var remainingDistance = calcDistance(moveVector.x, 0, moveVector.y, 0);
            var moveRatio = updateMoveDistance / remainingDistance;
            
            // Actual distance to move
            var actualMoveVector = {x: moveVector.x * moveRatio, y: moveVector.y * moveRatio};
            
            // Update location
            that.origin = {x: that.origin.x + actualMoveVector.x, y: that.origin.y + actualMoveVector.y};
        }
        
        return that;
    }
    
    return {
        Creep: Creep
    }
}(FORTIFY.Util));


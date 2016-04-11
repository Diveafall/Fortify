
FORTIFY.Creep = (function(Util) {
    
    var Constants = {
        get creepColor() { return "#0000FF"; },
        get creepSpeed() { return 0.03; }
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
        var spec = { cellSize: { horizCells: 0.5, vertiCells: 0.5 } };
        spec.frame = {
            x: 0, y: 0, 
            width: spec.cellSize.horizCells * FORTIFY.Constants.gridCellDimensions.width, 
            height: spec.cellSize.vertiCells * FORTIFY.Constants.gridCellDimensions.height
        }
        
        var that = FORTIFY.View(spec);
        
        that.creepColor = Constants.creepColor;
        
        that.cellSize = spec.cellSize;
        that.radius = that.height;
        
        that.center = Util.pointCoordFromLocation(grid.creepSpawnLoc.row, 0);
        
        that.endLoc = grid.creepEndLoc;
        
        // return the total number of cells required for this tower
        that.totalCells = function() { return spec.cellSize.horizCells * spec.cellSize.vertiCells; };
        
        // distance formula
        var calcDistance = function(x1, x2, y1, y2) {
            return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
        }
        
        var currCell = Util.loc(grid.creepSpawnLoc.row, grid.creepSpawnLoc.col);
        
        var updateNextCell = function(row, col) {
            var nextCoord = Util.pointCoordFromLocation(row, col);
            that.nextCell = {
                x: nextCoord.x,
                y: nextCoord.y,
                row: row,
                col: col
            };
        }
        updateNextCell(that.endLoc.row, that.endLoc.col);
        
        var needsNewNextCell = function(grid) {
            var currGridLoc = Util.gridLocationFromCoord(that.center.x, that.center.y);
            
            // Check if grid is still available and we haven't moved to a new cell already
            if (grid[that.nextCell.row][that.nextCell.col].isAvailable() 
                && currGridLoc.row != that.nextCell.row
                && currGridLoc.col != that.nextCell.col) {
                return false;
            }
            return true;
        }
        
        // test function       
        // var testLocs = [Util.loc(0,0), Util.loc(1,1), Util.loc(21, 43)];
        // for (var i = 0; i < testLocs.length; i++) {
        //     console.log(shortestPath(grid.getGridCopy(), testLocs[i], that.endLoc));
        // }
        
        that.update = function(elapsedTime, currGrid) {
            // Steps for updating (TODO): 
            // 1. Check if current destination cell is still open, if it is keep moving there
            // 2. If not available or no current cell, do shortest path and find next cell
            var grid = currGrid.getGridCopy();
            if (needsNewNextCell(grid)) {
                currCell = Util.gridLocationFromCoord(that.center.x, that.center.y);
                var nextCell = nextStep(grid, currCell, that.endLoc);
                console.log(nextCell);
                updateNextCell(nextCell.row, nextCell.col);
            }
            
            // Direction to move
            var moveVector = {x: that.nextCell.x - that.origin.x, y: that.nextCell.y - that.origin.y};
            
            // Scale distance so we move a constant amount
            var updateMoveDistance = Constants.creepSpeed * elapsedTime;
            var remainingDistance = calcDistance(moveVector.x, 0, moveVector.y, 0);
            var moveRatio = updateMoveDistance / remainingDistance;
            
            // Actual distance to move
            var actualMoveVector = {x: moveVector.x * moveRatio, y: moveVector.y * moveRatio};
            
            // Update location
            that.center = {x: that.center.x + actualMoveVector.x, y: that.center.y + actualMoveVector.y};
            //console.log(that.origin.x + " " + that.origin.y);
        }
        
        return that;
    }
    
    return {
        Creep: Creep
    }
}(FORTIFY.Util));

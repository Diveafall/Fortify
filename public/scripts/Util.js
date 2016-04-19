FORTIFY.Constants = (function() {
    var that = {
        get gridCellDimensions() { return { width: 15, height: 15 }; },
        get gridCellBorder() { return 1; },
        get gridAvailableCellColor() { return 'rgba(0, 255, 0, 1)'; },
        get gridUnavailableCellColor() { return 'rgba(255, 0, 0, 1)'; },
        get gridHighlightedCellColor() { return 'rgba(75, 0, 130, 1)'; },
        get gridUnavailableHighlightedColor() { return 'rgba(255, 0, 255, 1)'; }
    } 
    
    return that;
}());

FORTIFY.Util = (function() {
    
    var canvas = document.getElementById('canvas-main'),
        numberOfRows = 0,
        numberOfCols = 0;
 
    function init() {
        numberOfRows = canvas.height / FORTIFY.Constants.gridCellDimensions.height
        numberOfCols = canvas.width / FORTIFY.Constants.gridCellDimensions.width;
    }
 
    function loc(row, col) {
        return {
            row: row,
            col: col
        };
    }
    
    // Return (row, col) location from (x,y) coordinate
    function gridLocationFromCoord(x, y) {
        var row = Math.floor((y / canvas.height) * numberOfRows);
        var col = Math.floor((x / canvas.width) * numberOfCols);
        
        return loc(row, col);
    }

    // Returns a Point object representing the center of the grid cell
    // Needs to be origin so creep can have that as their target
    function pointCoordFromLocation(row, col) {
        return FORTIFY.Point(col * FORTIFY.Constants.gridCellDimensions.width + FORTIFY.Constants.gridCellDimensions.width/2,
            row * FORTIFY.Constants.gridCellDimensions.height + FORTIFY.Constants.gridCellDimensions.height/2);
    }
    
    // Copy of grid
    function resetGridVisited(grid) {
        var newGrid = new Array(grid.length);

        for (var i = 0; i < grid.length; i++) {
            newGrid[i] = new Array(grid[i].length);
            for (var j = 0; j < grid[i].length; j++) {
                grid[i][j].resetVisited();
                newGrid[i][j] = grid[i][j];
            }
        }

        return newGrid;
    }
    
    return {
        init: init,
        loc: loc,
        gridLocationFromCoord: gridLocationFromCoord,
        pointCoordFromLocation: pointCoordFromLocation,
        resetGridVisited: resetGridVisited
    }
    
}());
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

    // Returns a Point object representing the origin of the grid cell
    function pointCoordFromLocation(row, col) {
        return FORTIFY.Point(col * FORTIFY.Constants.gridCellDimensions.width, row * FORTIFY.Constants.gridCellDimensions.height);
    }
    
    // Shallow copy of grid
    function copyGrid(grid) {
        var newGrid = new Array(grid.length);

        for (var i = 0; i < grid.length; i++) {
            newGrid[i] = grid[i].slice();
        }

        return newGrid;
    }
    
    return {
        init: init,
        loc: loc,
        gridLocationFromCoord: gridLocationFromCoord,
        pointCoordFromLocation: pointCoordFromLocation,
        copyGrid: copyGrid
    }
    
}());
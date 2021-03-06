FORTIFY.Point = function(x, y) {
    var that = {}, _x = { main: x, render: x }, _y = { main: y, render: y };
    
    // these are the actual positions
    Object.defineProperty(that, 'x', {
        get: function() { return _x.main; },
        set: function(newX) { _x.main = newX, _x.render = newX; }
    });
    
    Object.defineProperty(that, 'y', {
        get: function() { return _y.main },
        set: function(newY) { _y.main = newY; _y.render = newY; }
    });
    
    // these are the rendering positions, in case the point is being animated
    Object.defineProperty(that, 'rx', {
        get: function() { return _x.render; }
    });
    
    Object.defineProperty(that, 'ry', {
        get: function() { return _y.render; }
    });
    
    // return angle with the point
    that.angle = function(point) {
        var dy = point.y - that.y, dx = point.x - that.x;
        if (that.x > point.x) { // account for slightly different direction of the x-axis for html5 canvas
            return Math.PI + Math.atan(dy / dx);
        } else {
            var angle = Math.atan(dy / dx);
            return angle < 0 ? angle + 2 * Math.PI : angle;
        }
    };
    
    // add vectors and return
    that.add = function(point) {
        return FORTIFY.Point(that.x + point.x, that.y + point.y);
    };
    
    // multiply vectors and return
    that.multiply = function(scalar) {
        return FORTIFY.Point(that.x * scalar, that.y * scalar);
    };
    
    // return distance from here to point
    that.distance = function(point) {
        return Math.sqrt(Math.pow((that.y - point.y), 2.0) + Math.pow((that.x - point.x), 2.0));
    };
    
    return that;
};

FORTIFY.Size = function(width, height) {
    var that = {}, _width = { main: width, render: width }, _height = { main: height, render: height };
    
    // actual size
    Object.defineProperty(that, 'width', {
        get: function() { return _width.main; },
        set: function(newWidth) { _width.main = newWidth, _width.render = newWidth; }
    });
    
    Object.defineProperty(that, 'height', {
        get: function() { return _height.main; },
        set: function(newHeight) { _height.main = newHeight, _height.render = newHeight; }
    });
    
    // rendering size
    Object.defineProperty(that, 'rwidth', {
        get: function() { return _width.render; }
    });
    
    Object.defineProperty(that, 'rheight', {
        get: function() { return _height.render; }
    });
    
    return that;
};

FORTIFY.Rect = function(x, y, width, height) {
    var that = {},
        _origin = FORTIFY.Point(x, y), 
        _size = FORTIFY.Size(width, height), 
        _center = FORTIFY.Point(x + width / 2, y + height / 2);
        
    updateBorders();
    
    Object.defineProperty(that, 'origin', {
        get: function() { return _origin; },
        set: function(newOrigin) {
            _origin = newOrigin;
            _center = FORTIFY.Point(_origin.x + _size.width / 2, _origin.y + _size.height / 2);
            updateBorders();
        }
    });
    
    Object.defineProperty(that, 'center', {
        get: function() { return _center; },
        set: function(newCenter) {
            _center = newCenter;
            _origin = FORTIFY.Point(_center.x - _size.width / 2, _center.y - _size.height / 2);
            updateBorders();
        }
    });
    
    Object.defineProperty(that, 'size', {
        get: function() { return _size; },
        set: function(newSize) { _size = newSize; updateBorders(); }
    });
    
    function updateBorders() {
        that.left = _origin.x;
        that.right = _origin.x + _size.width;
        that.top = _origin.y;
        that.bottom = _origin.y + _size.height;
    }
    
    return that;
};

FORTIFY.View = function(specs) {
    var that = {};
    
    that.enabled = true;
    that.frame = FORTIFY.Rect(specs.frame.x, specs.frame.y, specs.frame.width, specs.frame.height);
    that.containerFrame = specs.containerFrame;
    
    Object.defineProperty(that, 'origin', {
        get: function() { return that.frame.origin; },
        set: function(newOrigin) {
            that.frame.origin = newOrigin;
            that.layoutSubviews && that.layoutSubviews();
        }
    });
    
    Object.defineProperty(that, 'center', {
        get: function() { return that.frame.center; },
        set: function(newCenter) {
            that.frame.center = newCenter;
            that.layoutSubviews && that.layoutSubviews();
        }
    });
    
    Object.defineProperty(that, 'width', {
        get: function() { return that.frame.size.width; },
        set: function(newWidth) { 
            that.frame.size.width = newWidth; 
            that.layoutSubviews && that.layoutSubviews(); 
        }
    });
    
    Object.defineProperty(that, 'height', {
        get: function() { return that.frame.size.height; },
        set: function(newHeight) { 
            that.frame.size.height = newHeight; 
            that.layoutSubviews && that.layoutSubviews(); 
        }
    });
    
    Object.defineProperty(that, 'left', {
        get: function() { return that.frame.left; }
    });
    
    Object.defineProperty(that, 'right', {
        get: function() { return that.frame.right; }
    });
    
    Object.defineProperty(that, 'top', {
        get: function() { return that.frame.top; }
    });
    
    Object.defineProperty(that, 'bottom', {
        get: function() { return that.frame.bottom; }
    });
    
    that.didCollideWith = function(view) {
		return !(
			view.left > that.right ||
			view.right < that.left ||
			view.top > that.bottom ||
			view.bottom < that.top
		);
	};
    
    that.doesContain = function(point) {
        return !(
            point.x < that.left ||
            point.x > that.right ||
            point.y < that.top ||
            point.y > that.bottom
        );
    };
    
    return that;
};


/**
 * View that can be upgraded. Must include initial level and array of levels
 * 
 * @constructor
 */
FORTIFY.UpgradableView = function(spec) {
    var that = FORTIFY.View(spec);  
    
    that.canUpgrade = function() {
        return spec.level + 1 < spec.levels.length;
    };
    
    that.upgrade = function() {
        if (that.canUpgrade()) {
            spec.level++;
        }
    };
    
    return that;
};
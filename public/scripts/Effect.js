FORTIFY.components.Effect = (function(model) { 
    var Constants = {
        get slowRatio() { return 0.2; },
        get slowDuration() { return 500; }
    };
       
    /**
     * Basic Effect
     * 
     * @constructor
     */
    function Effect(spec) {
        var that = {}, timer = 0, expired = false;
        
        // returns true if effect has expired
        that.hasExpired = function() { return expired; };
        
        // called when effect has expired
        that.expired = function() {};
        
        // applies per second effect on stats
        that.affect = function(stats) {};
        
        that.update = function(elapsedTime) {
            timer += elapsedTime;
            if (timer >= spec.duration) {
                expired = true;
                that.expired();
                timer = 0;
            }
        };
        
        // undo the results of the effect
        that.revert = function() {};
        
        return that;
    }
    
    function SlowEffect() {
        var spec = { duration: Constants.slowDuration }, that = Effect(spec);
        
        that.affect = function(stats) {
            stats.moveDistance *= Constants.slowRatio; 
        };
        
        return that;
    }
    
    function FreezeEffect() {
        var spec = { duration: Constants.slowDuration }, that = Effect(spec);
        
        return that;
    }
    
    function FireEffect() {
        var that = Effect(spec);
        return that;
    }
    
    return {
        SlowEffect: SlowEffect,
        FreezeEffect: FreezeEffect,
        FireEffect: FireEffect
    };
    
}) (FORTIFY.model);
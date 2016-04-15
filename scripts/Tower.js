FORTIFY.components.Tower = (function(model, components) {
    
    /**
     * Represents a generic tower
     * 
     * @constructor
     * @param frame x, y, width, and height values
     * @param cellSize Number of rows and columns required in the grid
     * @param Projectile Type of projectile this tower fires
     * @param projectiles a container for projectiles
     */
    function Tower(spec) {
        var that = FORTIFY.View(spec), // this tower is a view
            fireTimer = 0, // timer for firing rate
            currentTarget = undefined, // shoot this guy until its dead or out of range
            currentLevel = 0;
            
        function setLevel(level) {
            currentLevel = level;
        }
        
        Object.defineProperty(that, 'name', {
            get: function() { return spec.levels[currentLevel].name; }
        });
        
        Object.defineProperty(that, 'shootRadius', {
            get: function() { return spec.levels[currentLevel].shootRadius; }
        });
        
        Object.defineProperty(that, 'shootRate', {
            get: function() { return spec.levels[currentLevel].shootRate; }
        });
        
        Object.defineProperty(that, 'damage', {
            get: function() { return spec.levels[currentLevel].damage; }
        });
        
        Object.defineProperty(that, 'purchaseCost', {
            get: function() { return spec.levels[currentLevel].purchaseCost; }
        });
        
        Object.defineProperty(that, 'sellCost', {
            get: function() { return spec.levels[currentLevel].sellCost; }
        });
        
        that.baseColor = '#808080';
        that.cannonColor = '#000000';
        
        that.cannonLength = that.height * 0.5;
        that.cannonWidth = that.width * 0.1;
        
        that.cellSize = spec.cellSize;
        that.radius = that.height / 3;
        
        setLevel(0);
        
        // rotation
        that.angle = 0;
        that.targetAngle = 0;
        that.rotationSpeed = 2 * Math.PI / 1000; // one rotation per second
        
        // FIRE!!!
        function fire() {
            
            var newProjectile = spec.Projectile({
                rotation: that.angle, // current angle of the tower
                moveRate: 400 / 1000, // pixels per second
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
        
        // returns true if object is withing shooting range
        that.objectIsWithinRange = function(object) {
            if (that.shootRadius > that.center.distance(object.center)) return true;
            return false;
        };
        
        // returns true if upgrade is possible
        that.canUpgrade = function() {
            return currentLevel < spec.levels.length - 1;
        };
        
        // upgrades the tower if not last level
        that.upgrade = function() {
            if (currentLevel + 1 <= spec.levels.length) {
                currentLevel++;
            }
        };
        
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
            // START LOOKING FOR A NEW TARGET
            var closestObjectDistance = that.shootRadius, creeps = model.creeps, distance;
            currentTarget = undefined;
            
            for (var i = 0; i < creeps.length; ++i) {
                if (!that.objectIsWithinRange(creeps[i]) && creeps[i].isDead()) continue; // if the creep is outside of range or dead, move on
                distance = that.center.distance(creeps[i].center);
                if (distance < closestObjectDistance) { // this new guy is closer than the old guy
                    closestObjectDistance = distance;
                    currentTarget = creeps[i];
                }
            }
            
            // we either already had a target that wasn't dead or out of range
            // or we couldn't find a new one
            if (currentTarget) { // if we found a new one
                that.targetAngle = that.center.angle(currentTarget.center); // update my target angle
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
                            fire(); // FIRE!
                            fireTimer = 0; // reset timer
                        }
                    }
                }
                
                // make sure we stay inside these bounds [0, 2 * PI]
                if (that.angle > 2 * Math.PI) that.angle = 0;
                if (that.angle < 0) that.angle += 2 * Math.PI;
            } else { // still have no target
                // CHILL xD
            }
        };
        
        return that;
    }
    
    function Turbolaser(spec) {
        var horizCells = 3, 
            vertiCells = 3, 
            width = horizCells * components.Constants.gridCellDimentions.width, 
            height = vertiCells * components.Constants.gridCellDimentions.height,
            levels = [
                {
                    name: "TURBO LASER",
                    damage: 10,
                    shootRate: 1000 / 5,
                    shootRadius: height * 2,
                    purchaseCost: 5,
                    sellCost: 3
                },
                {
                    name: "TURBO LASER",
                    damage: 15,
                    shootRate: 1000 / 6,
                    shootRadius: height * 3,
                    purchaseCost: 10,
                    sellCost: 7
                },
                {
                    name: "TURBO LASER",
                    damage: 20,
                    shootRate: 1000 / 7,
                    shootRadius: height * 4,
                    purchaseCost: 15,
                    sellCost: 12
                }
            ];
        
        var tower =  Tower({ 
            cellSize: { horizCells: horizCells, vertiCells: vertiCells }, 
            frame: { x: -width, y: -height, width: width, height: height },
            projectiles: spec.projectiles,
            containerFrame: spec.containerFrame,
            Projectile: components.Projectile,
            levels: levels
        });
        
        tower.render = function(context, a) {
            // Draw base
            if (a) {
                context.save();
                context.fillStyle = 'lightgrey';
                context.beginPath();
                context.arc(tower.center.x, tower.center.y, tower.shootRadius, 0, 2 * Math.PI);
                context.fill();
                context.restore();
            }
            
            // Draw base
            context.save();
            context.fillStyle = tower.baseColor;
            context.beginPath();
            context.arc(tower.center.x, tower.center.y, tower.radius, 0, 2 * Math.PI);
            context.fill();
            context.restore();
            
            // Draw cannon
            context.save();
            context.translate(tower.center.x, tower.center.y);
            context.rotate(tower.angle);
            context.translate(-tower.center.x, -tower.center.y);
            context.fillStyle = tower.cannonColor;
            context.fillRect(tower.center.x, tower.center.y - tower.cannonWidth / 2, tower.width / 2, tower.cannonWidth);
            
            context.restore();
        }
        
        return tower;
    }
    
    function Vulture(spec) {
        var horizCells = 3, 
            vertiCells = 3, 
            width = horizCells * components.Constants.gridCellDimentions.width, 
            height = vertiCells * components.Constants.gridCellDimentions.height,
            levels = [
                {
                    name: "TURBO LASER",
                    damage: 15,
                    shootRate: 1000 / 1,
                    shootRadius: height * 5,
                    purchaseCost: 5,
                    sellCost: 3
                },
                {
                    name: "TURBO LASER",
                    damage: 20,
                    shootRate: 1000 / 2,
                    shootRadius: height * 6,
                    purchaseCost: 10,
                    sellCost: 7
                },
                {
                    name: "TURBO LASER",
                    damage: 25,
                    shootRate: 1000 / 3,
                    shootRadius: height * 7,
                    purchaseCost: 15,
                    sellCost: 12
                }
            ];
        
        var tower =  Tower({ 
            cellSize: { horizCells: horizCells, vertiCells: vertiCells }, 
            frame: { x: -width, y: -height, width: width, height: height },
            projectiles: spec.projectiles,
            containerFrame: spec.containerFrame,
            Projectile: components.GuidedProjectile,
            levels: levels
        });
        
        tower.render = function(context, a) {
            // Draw base
            if (a) {
                context.save();
                context.fillStyle = 'lightgrey';
                context.beginPath();
                context.arc(tower.center.x, tower.center.y, tower.shootRadius, 0, 2 * Math.PI);
                context.fill();
                context.restore();
            }
            
            // Draw base
            context.save();
            context.fillStyle = tower.baseColor;
            context.beginPath();
            context.arc(tower.center.x, tower.center.y, tower.radius, 0, 2 * Math.PI);
            context.fill();
            context.restore();
            
            // Draw cannon
            context.save();
            context.translate(tower.center.x, tower.center.y);
            context.rotate(tower.angle);
            context.translate(-tower.center.x, -tower.center.y);
            context.fillStyle = tower.cannonColor;
            context.fillRect(tower.center.x, tower.center.y - tower.cannonWidth / 2, tower.width / 2, tower.cannonWidth);
            
            context.restore();
        }
        
        return tower;
    }
    
    return {
        Turbolaser: Turbolaser,
        Vulture: Vulture
    };
}) (FORTIFY.model, FORTIFY.components);
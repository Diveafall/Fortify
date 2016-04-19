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
        
        var width = spec.cellSize.horizCells * components.Constants.gridCellDimentions.width, 
            height = spec.cellSize.vertiCells * components.Constants.gridCellDimentions.height;
        spec.frame = { x: -width, y: -height, width: width, height: height };
        
        var that = FORTIFY.View(spec), // this tower is a view
            fireTimer = 0, // timer for firing rate
            currentLevel = 0;
            
        function setLevel(level) {
            if (level >= spec.levels.length) return;
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
        
        // handles cooldown and firing
        spec.coolDown = function(elapsedTime) {
            fireTimer += elapsedTime;
            if (fireTimer >= that.shootRate) { // time to shoot
                that.fire(); // FIRE!
                fireTimer = 0; // reset timer
            }
        };
        
        // temporary rendering files
        that.baseColor = '#808080';
        that.cannonColor = '#000000';
        
        that.cannonLength = that.height * 0.5;
        that.cannonWidth = that.width * 0.1;
        
        that.cellSize = spec.cellSize;
        that.radius = that.height / 3;
        
        // set initial level
        setLevel(0);
        
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
            if (currentLevel + 1 < spec.levels.length) {
                currentLevel++;
            }
        };
        
        // return the total number of cells required for this tower
        that.totalCells = function() { return spec.cellSize.horizCells * spec.cellSize.vertiCells; };
        
        return that;
    }
    
    // Single Target Tower
    function STower(spec) {
        var that = Tower(spec)
            currentTarget = undefined;
            
        // rotation
        that.angle = 0;
        that.targetAngle = 0;
        that.rotationSpeed = 2 * Math.PI / 1000; // one rotation per second
        
        // helper function: returns true if number is within range of the pivot
        function isWithinRange(num, pivot, range) {
            if (num >= pivot - range && num <= pivot + range) return true;
            return false;
        }
        
        that.fire = function() {
            var newProjectile = spec.Projectile({
                rotation: that.angle, // current angle of the tower
                containerFrame: that.containerFrame, // projectile can see the frame it's in
                damage: that.damage,
                frame: {
                    x: 0,
                    y: 0,
                    width: that.width * 0.3,
                    height: that.cannonWidth
                }
            });
            
            newProjectile.center = that.center;
            newProjectile.setTarget && newProjectile.setTarget(currentTarget);
            
            model.projectiles.push(newProjectile);
        };
        
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
                        spec.coolDown(elapsedTime); // HANDLE FIRING
                    }
                }
                
                // make sure we stay inside these bounds [0, 2 * PI]
                if (that.angle > 2 * Math.PI) that.angle = 0;
                if (that.angle < 0) that.angle += 2 * Math.PI;
            }
        };
            
        return that;
    }
    
    function AOETower(spec) {
        var that = Tower(spec);
        
        // how do I affect the creep?
        that.affect = function(creep) {};
        
        // affect every alive creep within range
        that.fire = function() {
            var creeps = model.creeps;
            for (var i = 0; i < creeps.length; ++i) {
                if (that.objectIsWithinRange(creeps[i]) && !creeps[i].isDead()) { // if creep is within range and not dead
                    that.affect(creeps[i]);
                }
            }
        };
        
        // AOE towers don't need to turn, they just fire every time cooldown is over
        that.update = function(elapsedTime) {
            spec.coolDown(elapsedTime);
        };
        
        return that;
    }
    
    function Turbolaser(spec) {
        var tower =  STower({ 
            cellSize: { horizCells: 3, vertiCells: 3 },
            containerFrame: spec.containerFrame,
            Projectile: components.Projectile,
            levels: [
                {
                    name: "TURBO LASER",
                    damage: 10,
                    shootRate: 1000 / 5,
                    shootRadius: 100,
                    purchaseCost: 5,
                    sellCost: 3
                },
                {
                    name: "MEGA LASER",
                    damage: 15,
                    shootRate: 1000 / 6,
                    shootRadius: 150,
                    purchaseCost: 10,
                    sellCost: 7
                },
                {
                    name: "HYPER LASER",
                    damage: 20,
                    shootRate: 1000 / 7,
                    shootRadius: 200,
                    purchaseCost: 15,
                    sellCost: 12
                }
            ]
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
        var tower =  STower({ 
            cellSize: { horizCells: 3, vertiCells: 3 },
            containerFrame: spec.containerFrame,
            Projectile: components.GuidedProjectile,
            levels: [
                {
                    name: "VULTURE",
                    damage: 25,
                    shootRate: 1000 / 1,
                    shootRadius: 200,
                    purchaseCost: 5,
                    sellCost: 3
                },
                {
                    name: "MEGA VULTURE",
                    damage: 35,
                    shootRate: 1000 / 2,
                    shootRadius: 250,
                    purchaseCost: 10,
                    sellCost: 7
                },
                {
                    name: "HYPER VULTURE",
                    damage: 45,
                    shootRate: 1000 / 3,
                    shootRadius: 300,
                    purchaseCost: 15,
                    sellCost: 12
                }
            ]
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
    
    function SeismicCharge(spec) {
        var tower =  AOETower({ 
            cellSize: { horizCells: 3, vertiCells: 3 },
            containerFrame: spec.containerFrame,
            levels: [
                {
                    name: "SEISMIC CHARGE",
                    damage: 25,
                    shootRate: 1000 / 1,
                    shootRadius: 100,
                    purchaseCost: 5,
                    sellCost: 3
                },
                {
                    name: "MEGA SEISMIC CHARGE",
                    damage: 35,
                    shootRate: 1000 / 2,
                    shootRadius: 150,
                    purchaseCost: 10,
                    sellCost: 7
                },
                {
                    name: "HYPER SEISMIC CHARGE",
                    damage: 45,
                    shootRate: 1000 / 3,
                    shootRadius: 200,
                    purchaseCost: 15,
                    sellCost: 12
                }
            ]
        });
        
        tower.baseColor = '#3F00FF';
        
        tower.affect = function(creep) {
            creep.takeDamage(tower.damage);
        }
        
        tower.render = function(context, a) {
            // Draw radius
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
            
            context.restore();
        }
        
        return tower;
    }
    
    function TimeWarp(spec) {
        var tower =  AOETower({ 
            cellSize: { horizCells: 3, vertiCells: 3 },
            containerFrame: spec.containerFrame,
            levels: [
                {
                    name: "TIME WARP",
                    damage: 0,
                    shootRate: 1000 / 1,
                    shootRadius: 100,
                    purchaseCost: 5,
                    sellCost: 3
                },
                {
                    name: "TIME MEGA WARP",
                    damage: 0,
                    shootRate: 1000 / 2,
                    shootRadius: 150,
                    purchaseCost: 10,
                    sellCost: 7
                },
                {
                    name: "TIME HYPER WARP",
                    damage: 0,
                    shootRate: 1000 / 3,
                    shootRadius: 200,
                    purchaseCost: 15,
                    sellCost: 12
                }
            ]
        });
        
        tower.affect = function(creep) {
            creep.applyEffect(components.Effect.SlowEffect());
        }
        
        tower.render = function(context, a) {
            // Draw radius
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
            
            context.restore();
        }
        
        return tower;
    }
    
    return {
        Turbolaser: Turbolaser,
        Vulture: Vulture,
        SeismicCharge: SeismicCharge,
        TimeWarp: TimeWarp
    };
}) (FORTIFY.model, FORTIFY.components);
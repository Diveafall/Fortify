FORTIFY.components.Tower = (function(model, components) {
    var CREEPTYPE = FORTIFY.Creep.CREEPTYPE;
    var Constants = {
        Blastoise: {
            indentRatio: 0.1,
            shootableCreeps: [CREEPTYPE.GROUND, CREEPTYPE.GROUND2, CREEPTYPE.AIR],
            shootSound: 'blast',
            levels: [
                {
                    name: "BLASTOISE",
                    damage: 10,
                    shootRate: 1000 / 5,
                    shootRadius: 100,
                    purchaseCost: 5,
                    sellCost: 3,
                    image: components.Managers.ImageManager.getImage('blastoise-1')
                },
                {
                    name: "MEGA BLASTOISE",
                    damage: 15,
                    shootRate: 1000 / 6,
                    shootRadius: 150,
                    purchaseCost: 10,
                    sellCost: 7,
                    image: components.Managers.ImageManager.getImage('blastoise-2')
                },
                {
                    name: "GIGA BLASTOISE",
                    damage: 20,
                    shootRate: 1000 / 7,
                    shootRadius: 200,
                    purchaseCost: 15,
                    sellCost: 12,
                    image: components.Managers.ImageManager.getImage('blastoise-2')
                }
            ]
        },
        Vulture: {
            indentRatio: 0.1,
            shootableCreeps: [CREEPTYPE.AIR],
            shootSound: 'missile',
            levels: [
                {
                    name: "VULTURE",
                    damage: 25,
                    shootRate: 1000 / 1,
                    shootRadius: 200,
                    purchaseCost: 5,
                    sellCost: 3,
                    image: components.Managers.ImageManager.getImage('vulture-1')
                },
                {
                    name: "MEGA VULTURE",
                    damage: 35,
                    shootRate: 1000 / 2,
                    shootRadius: 250,
                    purchaseCost: 10,
                    sellCost: 7,
                    image: components.Managers.ImageManager.getImage('vulture-2')
                },
                {
                    name: "HYPER VULTURE",
                    damage: 45,
                    shootRate: 1000 / 3,
                    shootRadius: 300,
                    purchaseCost: 15,
                    sellCost: 12,
                    image: components.Managers.ImageManager.getImage('vulture-3')
                }
            ]
        },
        SeismicCharge: {
            indentRatio: 0.1,
            shootableCreeps: [CREEPTYPE.GROUND, CREEPTYPE.GROUND2],
            shootSound: 'seismic',
            levels: [
                {
                    name: "SEISMIC CHARGE",
                    damage: 25,
                    shootRate: 1000 / 1,
                    shootRadius: 100,
                    purchaseCost: 5,
                    sellCost: 3,
                    image: components.Managers.ImageManager.getImage('seismic-1')
                },
                {
                    name: "MEGA SEISMIC CHARGE",
                    damage: 35,
                    shootRate: 1000 / 2,
                    shootRadius: 150,
                    purchaseCost: 10,
                    sellCost: 7,
                    image: components.Managers.ImageManager.getImage('seismic-2')
                },
                {
                    name: "HYPER SEISMIC CHARGE",
                    damage: 45,
                    shootRate: 1000 / 3,
                    shootRadius: 200,
                    purchaseCost: 15,
                    sellCost: 12,
                    image: components.Managers.ImageManager.getImage('seismic-3')
                }
            ]
        },
        TimeWarp: {
            indentRatio: 0.1,
            shootableCreeps: [CREEPTYPE.GROUND, CREEPTYPE.GROUND2],
            shootSound: 'warp',
            levels: [
                {
                    name: "TIME WARP",
                    damage: 0,
                    shootRate: 1000 / 1,
                    shootRadius: 100,
                    purchaseCost: 5,
                    sellCost: 3,
                    image: components.Managers.ImageManager.getImage('timewarp-1')
                },
                {
                    name: "TIME MEGA WARP",
                    damage: 0,
                    shootRate: 1000 / 2,
                    shootRadius: 150,
                    purchaseCost: 10,
                    sellCost: 7,
                    image: components.Managers.ImageManager.getImage('timewarp-2')
                },
                {
                    name: "TIME HYPER WARP",
                    damage: 0,
                    shootRate: 1000 / 3,
                    shootRadius: 200,
                    purchaseCost: 15,
                    sellCost: 12,
                    image: components.Managers.ImageManager.getImage('timewarp-3')
                }
            ]
        }
    };

    function Tower(spec) {
        
        var width = spec.cellSize.horizCells * components.Constants.gridCellDimentions.width, 
            height = spec.cellSize.vertiCells * components.Constants.gridCellDimentions.height,
            showRadius = false;
            
        spec.frame = { x: -width, y: -height, width: width, height: height };
        
        var that = FORTIFY.UpgradableView(spec), // this tower is a view
            fireTimer = 0; // timer for firing rate
        
        Object.defineProperty(that, 'name', {
            get: function() { return spec.levels[spec.level].name; }
        });
        
        Object.defineProperty(that, 'shootRadius', {
            get: function() { return spec.levels[spec.level].shootRadius; }
        });
        
        Object.defineProperty(that, 'shootRate', {
            get: function() { return spec.levels[spec.level].shootRate; }
        });
        
        Object.defineProperty(that, 'damage', {
            get: function() { return spec.levels[spec.level].damage; }
        });
        
        Object.defineProperty(that, 'purchaseCost', {
            get: function() { return spec.levels[spec.level].purchaseCost; }
        });
        
        Object.defineProperty(that, 'sellCost', {
            get: function() { return spec.levels[spec.level].sellCost; }
        });
 
        Object.defineProperty(that, 'image', {
            get: function() { return spec.levels[spec.level].image; }
        });
        
        // makes the shooting radius visible
        that.showRadius = function(value) {
            showRadius = value;
        };
        
        // returns true if the creep is shootable
        that.canShoot = function(creep) {
            for (var i = 0; i < spec.shootableCreeps.length; ++i) {
                if (creep.type === spec.shootableCreeps[i]) {
                    return true;
                }
            }
            return false;
        };
        
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
        
        // returns true if object is withing shooting range
        that.objectIsWithinRange = function(object) {
            if (that.shootRadius > that.center.distance(object.center)) return true;
            return false;
        };
        
        // return the total number of cells required for this tower
        that.totalCells = function() { return spec.cellSize.horizCells * spec.cellSize.vertiCells; };
        
        that.render = function(context) {
            if (showRadius) {
                context.save();
                context.globalAlpha = 0.5;
                context.fillStyle = 'lightgrey';
                context.beginPath();
                context.arc(that.center.x, that.center.y, that.shootRadius, 0, 2 * Math.PI);
                context.fill();
                context.restore();
            }
        };
        
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
                    width: that.width * 0.2,
                    height: that.width * 0.05
                }
            });
            
            newProjectile.center = that.center;
            newProjectile.setTarget && newProjectile.setTarget(currentTarget);
            
            model.projectiles.push(newProjectile);
            components.Managers.SoundManager.playSound(spec.shootSound);
        };
        
        that.update = function(elapsedTime) {
            // START LOOKING FOR A NEW TARGET
            var closestObjectDistance = that.shootRadius, creeps = model.creeps, distance;
            currentTarget = undefined;
            
            for (var i = 0; i < creeps.length; ++i) {
                if (!that.objectIsWithinRange(creeps[i]) && creeps[i].isDead() && !that.canShoot(creeps[i])) continue; // if the creep is outside of range or dead or can't be shot, move on
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
    
    // Area of Effect Tower
    function AOETower(spec) {
        var that = Tower(spec);
        
        // how do I affect the creep?
        that.affect = function(creep) {};
        
        // affect every alive creep within range
        that.fire = function() {
            var creeps = model.creeps, didAffectSomeone = false;
            for (var i = 0; i < creeps.length; ++i) {
                if (that.objectIsWithinRange(creeps[i]) && !creeps[i].isDead() && that.canShoot(creeps[i])) { // if creep is within range and not dead
                    that.affect(creeps[i]);
                    didAffectSomeone = true;
                }
            }
            if (didAffectSomeone) components.Managers.SoundManager.playSound(spec.shootSound);
        };
        
        // AOE towers don't need to turn, they just fire every time cooldown is over
        that.update = function(elapsedTime) {
            spec.coolDown(elapsedTime);
        };
        
        return that;
    }
    
    function Blastoise(spec) {
        var tower =  STower({ 
                cellSize: { horizCells: 3, vertiCells: 3 },
                containerFrame: spec.containerFrame,
                Projectile: components.Projectile,
                level: spec.level,
                levels: Constants.Blastoise.levels,
                shootableCreeps: Constants.Blastoise.shootableCreeps,
                shootSound: Constants.Blastoise.shootSound
            }), base = { render: tower.render };
        
        tower.render = function(context) {
            var indent = tower.width * Constants.Blastoise.indentRatio;
            base.render(context);
            context.save();
            context.translate(tower.center.x, tower.center.y);
            context.rotate(tower.angle);
            context.translate(-tower.center.x, -tower.center.y);
            context.drawImage(
                tower.image, tower.origin.x + indent, 
                tower.origin.y + indent, 
                tower.width - 2 * indent, 
                tower.height - 2 * indent
            );
            context.restore();
        }
        
        return tower;
    }
    
    function Vulture(spec) {
        var tower =  STower({ 
                cellSize: { horizCells: 3, vertiCells: 3 },
                containerFrame: spec.containerFrame,
                Projectile: components.GuidedProjectile,
                level: spec.level,
                levels: Constants.Vulture.levels,
                shootableCreeps: Constants.Vulture.shootableCreeps,
                shootSound: Constants.Vulture.shootSound
            }), base = { render: tower.render };
            
        tower.render = function(context, a) {
            var indent = tower.width * Constants.Vulture.indentRatio;
            base.render(context);
            context.save();
            context.translate(tower.center.x, tower.center.y);
            context.rotate(tower.angle);
            context.translate(-tower.center.x, -tower.center.y);
            context.drawImage(
                tower.image, tower.origin.x + indent, 
                tower.origin.y + indent, 
                tower.width - 2 * indent, 
                tower.height - 2 * indent
            );
            context.restore();
        }
        
        return tower;
    }
    
    function SeismicCharge(spec) {
        var tower =  AOETower({ 
                cellSize: { horizCells: 3, vertiCells: 3 },
                containerFrame: spec.containerFrame,
                level: spec.level,
                levels: Constants.SeismicCharge.levels,
                shootableCreeps: Constants.SeismicCharge.shootableCreeps,
                shootSound: Constants.SeismicCharge.shootSound
            }), base = { render: tower.render };
            
        tower.affect = function(creep) {
            creep.takeDamage(tower.damage);
        }
        
        tower.render = function(context) {
            var indent = tower.width * Constants.SeismicCharge.indentRatio;
            base.render(context);
            context.save();
            context.drawImage(
                tower.image, tower.origin.x + indent, 
                tower.origin.y + indent, 
                tower.width - 2 * indent, 
                tower.height - 2 * indent
            );
            context.restore();
        }
        
        return tower;
    }
    
    function TimeWarp(spec) {
        var tower =  AOETower({ 
                cellSize: { horizCells: 3, vertiCells: 3 },
                containerFrame: spec.containerFrame,
                level: spec.level,
                levels: Constants.TimeWarp.levels,
                shootableCreeps: Constants.TimeWarp.shootableCreeps,
                shootSound: Constants.TimeWarp.shootSound
            }), base = { render: tower.render };
        
        tower.affect = function(creep) {
            creep.applyEffect(components.Effect.SlowEffect());
        }
        
        tower.render = function(context) {
            var indent = tower.width * Constants.TimeWarp.indentRatio;
            base.render(context);
            context.save();
            context.drawImage(
                tower.image, tower.origin.x + indent, 
                tower.origin.y + indent, 
                tower.width - 2 * indent, 
                tower.height - 2 * indent
            );
            context.restore();
        }
        
        return tower;
    }
    
    return {
        Blastoise: Blastoise,
        Vulture: Vulture,
        SeismicCharge: SeismicCharge,
        TimeWarp: TimeWarp
    };
}) (FORTIFY.model, FORTIFY.components);
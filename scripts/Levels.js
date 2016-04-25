FORTIFY.Levels = function(creeps, grid) {
    var Constants = {
        levels: [
            { // LEVEL 1
                army: [
                    {
                        path: 0,
                        type: FORTIFY.Creep.CREEPTYPE.GROUND,
                        count: 10
                    },
                    {
                        path: 1,
                        type: FORTIFY.Creep.CREEPTYPE.AIR,
                        count: 20
                    }
                ],
                gold: 50
            },
            { // LEVEL 2
                
            }
        ],
        spawnCD: 1000,
        beginCD: 1000,
        beginNotifications: [
            // {
            //     when: 10000,
            //     done: false,
            //     text: '10 SECONDS LEFT!'
            // }
        ]
    };
    
    var spawnTimer = 0, beginTimer = 0, currentLevel = -1, internalUpdate = function() {}, notifications = [];
    
    function levelNotification(text) {
        var gridFrame = grid.frame;
        FORTIFY.particles.createText({
            text: text,
            font: '64px Arial',
            center: { x: gridFrame.center.x * 0.25, y: gridFrame.center.y },
            direction: { x: 0, y: -Math.PI / 2 },
            speed: 20,
            size: 64,
            lifetime: 2
        });
    }
    
    function endLevel() {
        creeps.length = 0; // kill all the creeps
    }
    
    function commenceLevel(level) {
        if (level >= 0 && level < Constants.levels.length) { // level exists
            endLevel(); // end current level
            
            currentLevel = level;
            
            levelNotification('LEVEL ' + (level + 1).toString() + ' BEGINS!');
            
            beginTimer = Constants.beginCD;
            notifications = Constants.beginNotifications;
            internalUpdate = updateBeginning;
        }
    }
    
    function nextLevel() {
        commenceLevel(currentLevel + 1);
    }
    
    function updateProgress(elapsedTime) {
        spawnTimer += elapsedTime;
        if (spawnTimer >= Constants.spawnCD) { // spawn a creep
            var numberOfDepletedArmies = 0;
            for (var i = 0; i < Constants.levels[currentLevel].army.length; ++i) {
                if (Constants.levels[currentLevel].army[i].count > 0) {
                    var newbornCreep = FORTIFY.Creep.createCreep({
                        grid: grid,
                        level: currentLevel + 1,
                        type: Constants.levels[currentLevel].army[i].type,
                        whichPath: Constants.levels[currentLevel].army[i].path
                    });
                    creeps.push(newbornCreep);
                    Constants.levels[currentLevel].army[i].count--;
                }
                if (Constants.levels[currentLevel].army[i].count < 1) numberOfDepletedArmies++;    
            }
            if (numberOfDepletedArmies === Constants.levels[currentLevel].army.length) { // this level is over!!!
                // nextLevel();
            }
            spawnTimer = 0;
        }
    }
    
    function updateBeginning(elapsedTime) {
        beginTimer -= elapsedTime;
        if (beginTimer < 0) { // level has begun
            internalUpdate = updateProgress; // level is now in progress
        } else {
            for (var i = 0; i < notifications.length; ++i) {
                if (beginTimer < notifications[i].when && !notifications[i].done) {
                    levelNotification(notifications[i].text);
                    notifications[i].done = true;
                    return;
                }
            }
        }
    }
    
    function update(elapsedTime) {
        internalUpdate(elapsedTime);        
    }
    
    return {
        update: update,
        nextLevel: nextLevel
    };
};
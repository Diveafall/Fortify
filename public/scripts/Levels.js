FORTIFY.Levels = function(creeps, grid, treasury, gameOver) {
    var Constants = {
        levels: [
            { // LEVEL 1
                waves: [
                    { // WAVE 1
                        army: [
                            {
                                path: 0,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 5
                            }
                        ],
                        gold: 50
                    },
                    {
                        army: [
                            {
                                path: 0,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 5
                            },
                            {
                                path: 1,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND2,
                                count: 5
                            }
                        ]
                    }
                ]
            },
            { // LEVEL 2
                waves: [
                    {
                        army: [
                            {
                                path: 0,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 10
                            }
                        ],
                        gold: 50
                    },
                    {
                        army: [
                            {
                                path: 0,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 10
                            },
                            {
                                path: 1,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND2,
                                count: 10
                            }
                        ]
                    }
                ]   
            },
            { // LEVEL 3
                waves: [
                    {
                        army: [
                            {
                                path: 3,
                                type: FORTIFY.Creep.CREEPTYPE.AIR,
                                count: 10
                            },
                            {
                                path: 0,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 10
                            },
                            {
                                path: 2,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND2,
                                count: 10
                            }
                        ],
                        gold: 50
                    },
                    {
                        army: [
                            {
                                path: 0,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 30
                            },
                            {
                                path: 2,
                                type: FORTIFY.Creep.CREEPTYPE.AIR,
                                count: 10
                            }
                        ]
                    }
                ]   
            },
            { // LEVEL 4
                waves: [
                    {
                        army: [
                            {
                                path: 2,
                                type: FORTIFY.Creep.CREEPTYPE.AIR,
                                count: 10
                            },
                            {
                                path: 1,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 20
                            },
                            {
                                path: 2,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND2,
                                count: 20
                            }
                        ],
                        gold: 50
                    },
                    {
                        army: [
                            {
                                path: 3,
                                type: FORTIFY.Creep.CREEPTYPE.GROUND,
                                count: 30
                            },
                            {
                                path: 1,
                                type: FORTIFY.Creep.CREEPTYPE.AIR,
                                count: 30
                            }
                        ]
                    }
                ]   
            }
        ],
        spawnCD: 1000,
        beginCD: 2000,
        waveCD: 1000,
        levelLabel: document.getElementById('level-label')
    };
    
    var spawnTimer = 0, beginTimer = 0, currentLevel = -1, currentWave = -1, internalUpdate = function() {};
    
    function levelNotification(text) {
        var gridFrame = grid.frame, 
            text = {
                text: text,
                font: '64px Oswald',
                //center: { x: gridFrame.center.x * 0.4, y: gridFrame.center.y },
                direction: { x: 0, y: -Math.PI / 2 },
                speed: 20,
                size: 64,
                lifetime: 2
            },
            width = FORTIFY.graphics.measureTextWidth(text);
            
        text.center = { x: gridFrame.center.x - width / 2, y: gridFrame.center.y }
        FORTIFY.particles.createText(text);
    }
    
    function isWaveInProgress() {
        return internalUpdate === updateProgress;
    }
    
    function endLevel() {
        creeps.length = 0; // kill all the creeps
    }
    
    function doesNextLevelExist() {
        return currentLevel + 1 < Constants.levels.length;
    }
    
    function doesNextWaveExist() {
        return currentWave + 1 < Constants.levels[currentLevel].waves.length;
    }
    
    function commenceLevel(level) {
        if (level >= 0 && level < Constants.levels.length) { // level exists
            endLevel(); // end current level
            
            currentLevel = level;
            currentWave = -1;
            Constants.levelLabel.innerHTML = (currentLevel + 1).toString();
            
            levelNotification('LEVEL ' + (currentLevel + 1).toString());
            
            beginTimer = Constants.beginCD;
            internalUpdate = updateLevelBeginning;
        }
    }
    
    function restartLevel() {
        currentWave = 0;
        commenceLevel(currentLevel);
    }
    
    function nextWave() {
        if (doesNextWaveExist()) { // next wave
            currentWave++;
            
            if (currentWave === 0) FORTIFY.Clock.start();
            else FORTIFY.Clock.resume();
            
            levelNotification('WAVE ' + (currentWave + 1).toString()); // notify user
            internalUpdate = updateProgress;
            
            treasury.addGold(Constants.levels[currentLevel].waves[currentWave].gold);
            FORTIFY.Clock.start();
        } else { // current wave was the last one
            nextLevel();
        }
    }
    
    function nextLevel() {
        commenceLevel(currentLevel + 1);
    }
    
    function updateProgress(elapsedTime) {        
        spawnTimer += elapsedTime;
        if (spawnTimer >= Constants.spawnCD) { // spawn the creeps
            var wave = Constants.levels[currentLevel].waves[currentWave], numberOfDepletedUnits = 0;
            for (var unit = 0; unit < wave.army.length; ++unit) {
                if (wave.army[unit].count > 0) {
                    var newCreep = FORTIFY.Creep.createCreep({
                        grid: grid, // sees the grid
                        level: currentLevel + 1,
                        type: wave.army[unit].type,
                        whichPath: wave.army[unit].path
                    });
                    creeps.push(newCreep);
                    wave.army[unit].count--;
                } else {
                    numberOfDepletedUnits++;
                }
            }
            spawnTimer = 0; // reset timer
            if (numberOfDepletedUnits === wave.army.length && creeps.length === 0) { // this wave is over
                if (doesNextWaveExist() || doesNextLevelExist()) {
                    beginTimer = Constants.waveCD;
                    internalUpdate = updateWaveBeginning;
                    FORTIFY.Clock.pause();
                } else { // YOU WON!
                    levelNotification('VICTORY!');
                    gameOver();
                }
            } 
        }
    }
    
    function updateWaveBeginning(elapsedTime) {
        beginTimer -= elapsedTime;
        if (beginTimer < 0) {
            nextWave(); // wave has begun
        }
    }
    
    function updateLevelBeginning(elapsedTime) {
        beginTimer -= elapsedTime;
        if (beginTimer < 0) { // level has begun
            beginTimer = Constants.waveCD;
            internalUpdate = updateWaveBeginning; // level/wave is now in progress
        }
    }
    
    function getCurrentLevel() {
        return currentLevel;
    }
    
    function update(elapsedTime) {
        internalUpdate(elapsedTime);        
    }
    
    return {
        update: update,
        nextLevel: nextLevel,
        nextWave: nextWave,
        restartLevel: restartLevel,
        isWaveInProgress: isWaveInProgress,
        getCurrentLevel: getCurrentLevel
    };
};
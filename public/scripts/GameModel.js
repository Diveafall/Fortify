
FORTIFY.model = (function(components, graphics, particles, score) {
	var grid,
        towers = [],
        creeps = [],
        projectiles = [],
        remainingLives,
        levels,
        gameOver,
        treasury,
        internalUpdate,
		internalRender,
        timeToNextSpawn = 0,
        testCreepLeftRight, // Used for checking that creep still have paths. Never updated or rendered.
        testCreepTopBottom;

	//------------------------------------------------------------------
	//
	// Prepares a newly initialized game model, ready for the start of
	// the game.
	//
	//------------------------------------------------------------------
	function initialize() {
        console.log('game model initialization');
        
        remainingLives = 10;
        gameOver = false;
        particles.reset();
        score.reset();
        
        towers = [];
        
        grid = components.GameGrid({ frame: graphics.canvasFrame() });
        treasury = FORTIFY.Gold();
        
        // INITIALIZE STUFF
        FORTIFY.Util.init();
        levels = FORTIFY.Levels(creeps, grid, treasury, function() { endGame(); });
        
        // REGISTER KEYS
        FORTIFY.input.Keyboard.registerCommand('sell', undefined, FORTIFY.StatsPanel.leftButtonPressed);
        FORTIFY.input.Keyboard.registerCommand('upgrade', undefined, FORTIFY.StatsPanel.rightButtonPressed);
        FORTIFY.input.Keyboard.registerCommand('next-level', undefined, FORTIFY.Levels.nextLevel);
        FORTIFY.input.Keyboard.registerCommand('buy-blastoise', undefined, buyBlastoise);
        FORTIFY.input.Keyboard.registerCommand('buy-vulture', undefined, buyVulture);
        FORTIFY.input.Keyboard.registerCommand('buy-seismic', undefined, buySeismic);
        FORTIFY.input.Keyboard.registerCommand('buy-timewarp', undefined, buyTimewarp);
        
        var leftRightSpec = {
            grid: grid,
            level: 0,
            whichPath: 0,
            type: 0
        };
        var topBottomSpec = {
            grid: grid,
            level: 0,
            whichPath: 2,
            type: 0
        }
        
        testCreepLeftRight = components.Creep.createCreep(leftRightSpec);
        testCreepTopBottom = components.Creep.createCreep(topBottomSpec);
        
        levels.nextLevel();
        switchToPlayingMode();
	}
    
    function buyBlastoise() {
        towerPurchased(components.Tower.Blastoise);
    }
    
    function buyVulture() {
        towerPurchased(components.Tower.Vulture);
    }
    
    function buySeismic() {
        towerPurchased(components.Tower.SeismicCharge);
    }
    
    function buyTimewarp() {
        towerPurchased(components.Tower.TimeWarp);
    }
    
    function pause() {
        FORTIFY.pages['page-game'].pause();
    }
    
    function cancelTowerPlacement() {
        grid.endPlacement(false);
        switchToPlayingMode();
    }
    
    function switchToPlayingMode() {
        internalUpdate = updatePlaying;
        internalRender = renderPlaying;
        
        FORTIFY.input.Mouse.registerClickHandler(playingMouseClick);
        FORTIFY.input.Mouse.registerMoveHandler(playingMouseMove);
        
        FORTIFY.input.Keyboard.registerCommand('pause/cancel', undefined, pause);
    }
    
    function switchToPlacingMode() {
        internalUpdate = updatePlacing;
        internalRender = renderPlacing;
        
        FORTIFY.input.Mouse.registerClickHandler(placementMouseClick);
        FORTIFY.input.Mouse.registerMoveHandler(placementMouseMove);
        
        FORTIFY.input.Keyboard.registerCommand('pause/cancel', undefined, cancelTowerPlacement);
    }
    
    function notification(text) {
        var gridFrame = grid.frame, 
            text = {
                text: text,
                font: '18px Oswald',
                direction: { x: 0, y: -Math.PI / 2 },
                speed: 20,
                size: 18,
                lifetime: 4
            };
            
        text.center = { x: gridFrame.center.x, y: gridFrame.size.height * 0.9 }
        FORTIFY.particles.createText(text);
    }
    
    // TOWER PURCHASE/SELLING AND PLACEMENT
    function towerPurchased(TowerType) {  
        var tower = TowerType({ level: 0, containerFrame: grid.frame, projectiles: projectiles }); // create the tower 
        if (treasury.removeGold(tower.purchaseCost)) {     
            grid.beginPlacement(tower); // pass it to grid for placement setup
            FORTIFY.StatsPanel.towerSelected(tower, true); // show the new tower on stats panel
            
            switchToPlacingMode();
        } else {
            notification('NOT ENOUGH MONEY');
        }
    }
    
    function towerSold(tower) {
        treasury.addGold(tower.sellCost);
        grid.removeTowerFromGrid(tower);
        var index = towers.indexOf(tower);
        towers.splice(index, 1);
        components.Managers.SoundManager.playSound('sold');
    }
    
    var canvasElement = document.getElementById('canvas-main');
    function calculateMouseOffset(event) {
        var boundingRect = canvasElement.getBoundingClientRect();
        
        var offsetX = event.clientX - boundingRect.left,
            offsetY = event.clientY - boundingRect.top;
        if (offsetX < 0) {
            offsetX = 0;
        } else if (offsetX > canvasElement.width) {
            offsetX = canvasElement.width;
        }
        if (offsetY < 0) {
            offsetY = 0;
        } else if (offsetY > canvasElement.height) {
            offsetY = canvasElement.height;
        }
        
        return {
            x: offsetX,
            y: offsetY
        }
    }
    
    function placementMouseMove(event) {
        var offset = calculateMouseOffset(event);
        grid.update(offset.x, offset.y);
	}
    

    
    function placementMouseClick(event) {
        var offset = calculateMouseOffset(event);
        var point = { x: offset.x, y: offset.y };
        
        if (grid.isPlacing() && event.target === canvasElement) {
            if (grid.isValid()) { // grid can accomodate this tower
                // places the tower in the grid, remembers it
                var tower = grid.endPlacement(true),
                    towerWasValid = true;
                    
                // Test entire path from left to right and top to bottom
                towerWasValid = testCreepLeftRight.updatePath(grid) 
                    && testCreepTopBottom.updatePath(grid);
                
                // Check each creep to ensure they still have paths
                for (var i = 0; i < creeps.length && towerWasValid; ++i) {
                    towerWasValid = creeps[i].updatePath(grid);
                }
                
                if (towerWasValid) {
                    // if we got here, then all creeps have paths
                    towers.push(tower); // push tower to container
                    FORTIFY.StatsPanel.hide(); // hide the stats panel
                    components.Managers.SoundManager.playSound('buy');
                // console.log('been here');
                    
                    switchToPlayingMode();
                } else {
                    // remove the tower from the grid
                    grid.removeTowerFromGrid(tower);
                    
                    // Redo all paths for creeps
                    for (var i = 0; i < creeps.length; i++) {
                        creeps[i].updatePath(grid);
                    }
                    
                    // continue tower placement
                    grid.beginPlacement(tower);
                }
            } else {
                components.Managers.SoundManager.playSound('no');
                notification('INVALID PLACEMENT');
            }
        }
	}
    
    function updatePlacing(elapsedTime) {
        particles.update(elapsedTime);
    }
    
    function renderPlacing() {
        graphics.drawBackground(grid.frame);
        grid.render(graphics);
        for (var i = 0; i < towers.length; ++i) {
            graphics.drawTower(towers[i]);
        }
        for (var i = 0; i < creeps.length; i++) {
            creeps[i].render(graphics)
        }
        particles.render(graphics);
    }

	function processInput(elapsedTime) {
		FORTIFY.input.Keyboard.update(elapsedTime);
        FORTIFY.input.Mouse.update(elapsedTime);
	}
    
	function playingMouseMove(event) {
	}
    
	function playingMouseClick(event) {
        var offset = calculateMouseOffset(event);
        var point = { x: offset.x, y: offset.y };
        for (var i = 0; i < towers.length; ++i) {
            if (towers[i].doesContain(point)) {
                FORTIFY.StatsPanel.towerSelected(towers[i]);
                return;
            }
        }
        FORTIFY.StatsPanel.towerSelected(undefined);
	}
    
    // Create creep death particles
    function creepDeath(creep) {
        var effectSpec = {
            type: 'creep' + (creep.type + 1), // Add one to match actual image names
            center: creep.center,
            speed: {mean: 20, stdev: 2},
            size: {mean: 5, stdev: 1},
            lifetime: { mean: 0.75, stdev: 0.25},
            particleCount: 15,
            spin: true
        }
        particles.createEffect(effectSpec);
        
        var textSpec = {
            text: creep.points,
            font: '16px Arial',
            center: creep.center,
            direction: {x: 0, y: -Math.PI/2},
            speed: 20,
            size: 16,
            lifetime: 1
        }
        particles.createText(textSpec);
    }
    
    //------------------------------------------------------------------
    //
	// Update creeps
	//
	//------------------------------------------------------------------
    function updateCreeps(elapsedTime) {        
        var i,
            creepsToRemove = [];
        for (i = 0; i < creeps.length; i++) {
            if (creeps[i].update(elapsedTime, grid)) {
                // Died or reached end, remove
                if (creeps[i].reachedEnd()) {
                    remainingLives--;
                } else {
                    creepDeath(creeps[i]);
                    components.Managers.SoundManager.playSound('explosion');
                    score.add(creeps[i].points);
                    treasury.addGold(creeps[i].gold);
                }
                creepsToRemove.push(i);
            }
        }
        
        for (i = creepsToRemove.length; i--; i >= 0) {
            creeps.splice(creepsToRemove[i], 1);
        }
                
        levels.update(elapsedTime);
    }
    
    function endGame() {
        if (remainingLives <= 0) gameOver = true;
        score.addEndGameScore(towers, levels.getLevel());
        score.submit();
        console.log("Game over!");
        levels.gameOver();
    }
    
    //------------------------------------------------------------------
	//
	// Update state of the game while playing
	//
	//------------------------------------------------------------------
    function updatePlaying(elapsedTime) {
        var i;
        FORTIFY.Clock.update(elapsedTime);
        
        if (gameOver) {
            return;
        } else if (remainingLives <= 0) {
            endGame();
        }
            
        // Creep updates
        updateCreeps(elapsedTime);
        
        // Tower updates
        for (i = 0; i < towers.length; ++i) {
            towers[i].update(elapsedTime);
        }
        
        // Projectile updates
        for (i = projectiles.length - 1; i >= 0; i--) {
            projectiles[i].update(elapsedTime);
            if (projectiles[i].type === 'guided') {
                var effectSpec = {
                    type: 'smoke',
                    center: projectiles[i].center,
                    speed: {mean: 20, stdev: 2},
                    size: {mean: 3, stdev: 1},
                    lifetime: { mean: 0.5, stdev: 0.25},
                    particleCount: 6,
                    spin: true
                }
                particles.createEffect(effectSpec);
            }
            if (!projectiles[i].isWithinBounds()) { // if projectile is out of its bounds
                projectiles.splice(i, 1); // remove it
            } else {
                for (var j = 0; j < creeps.length; ++j) { // projectile hasn't died let's see if it has collided with any creep
                    if (projectiles[i].didCollideWith(creeps[j])) { // if they collided
                        creeps[j].takeDamage(projectiles[i].damage); // creep takes damage
                        // if (projectiles[i].type === 'guided') {
                            var effectSpec = {
                                type: 'fire',
                                center: projectiles[i].center,
                                speed: {mean: 10, stdev: 5},
                                size: {mean: 10, stdev: 1},
                                lifetime: { mean: 0.5, stdev: 0.3},
                                particleCount: 20,
                                spin: true
                            }
                            particles.createEffect(effectSpec);
                        //}
                        projectiles.splice(i, 1); // remove projectile
                        break;
                    }
                }
            }
        }
        
        particles.update(elapsedTime);
    }
    
    //------------------------------------------------------------------
	//
	// Render the state of the game while playing
	//
	//------------------------------------------------------------------
	function renderPlaying() {
        graphics.drawBackground(grid.frame);
        FORTIFY.Clock.outputClock();
        for (var i = 0; i < towers.length; ++i) {
            graphics.drawTower(towers[i]);
        }
        for (var i = 0; i < projectiles.length; ++i) {
            graphics.drawProjectile(projectiles[i]);
        }
        for (var i = 0; i < creeps.length; i++) {
            creeps[i].render(graphics);
        }
        particles.render(graphics);
        score.render();
        document.getElementById('lives-label').innerHTML = remainingLives;
	}

	//------------------------------------------------------------------
	//
	// Update the state of the game model based upon the passage of time.
	//
	//------------------------------------------------------------------
	function update(elapsedTime) {
		internalUpdate(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// Render the current state of the game model.
	//
	//------------------------------------------------------------------
	function render() {
		internalRender();
	}
    
    function nextLevel() {
        levels && levels.nextLevel();
    }
    
    function restart() {
        if (gameOver) { initialize(); return; }
        levels && levels.restartLevel();
    }
    
    function upgradeTower(tower) {
        if (treasury.removeGold(tower.upgradeCost)) {
            tower.upgrade();
            return true;
        }
        return false;
    }

	return {
		initialize: initialize,
		processInput: processInput,
		update: update,
		render: render,
        // towerPurchased: towerPurchased,
        towerSold: towerSold,
        creeps: creeps,
        projectiles: projectiles,
        nextLevel: nextLevel,
        restart: restart,
        upgradeTower: upgradeTower,
        buyBlastoise: buyBlastoise,
        buySeismic: buySeismic,
        buyVulture: buyVulture,
        buyTimewarp: buyTimewarp
	};
}) (FORTIFY.components, FORTIFY.graphics, FORTIFY.particles, FORTIFY.score);

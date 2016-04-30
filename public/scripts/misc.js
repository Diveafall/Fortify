FORTIFY.Clock = (function() {
    function timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }
    
    var begin, isActive = false, time = {}, output = document.getElementById('time-label');
    
    return {
        /**
         * Starts the clock
         * 
         * @param outputElement (HTMLElement) This element's innerHTML will this clock's output path
         */
        start: function() {
            isActive = true;
            begin = timestamp();
        },
        resume: function() {
            isActive = true;
        },
        pause: function() {
            isActive = false;
        },
        update: function() {
            if (isActive) {
                var timer = (timestamp() - begin) / 1000;
                time.minutes = Math.floor(timer / 60);
                time.seconds = Math.floor(timer % 60);
            }
        },
        outputClock: function() {
            if(isActive) output.innerHTML = time.minutes + (time.seconds < 10 ? ':0' : ':') + time.seconds;
        }
    };
}) ();

FORTIFY.StatsPanel = (function() {
    var statPanel = document.getElementById('stats-panel'),
    
        nameLabel = document.getElementById('stat-name'),
        damageLabel = document.getElementById('stat-damage'),
        radiusLabel = document.getElementById('stat-radius'),
        rateLabel = document.getElementById('stat-rate'),
        upgradeLabel = document.getElementById('stat-upgrade'),
        
        costLabel = document.getElementById('stat-cost'),
        costTypeLabel = document.getElementById('cost-label'),
        
        buttons = document.getElementById('stat-buttons'),
        leftButton = document.getElementById('left-button'),
        rightButton = document.getElementById('right-button'),
        
        selectedTower = undefined,
        
        Constants = {
            get upgradeString() { return 'UPGRADE'; },
            get buyString() { return 'BUY'; },
            get sellCostString() { return 'SELL COST'; },
            get maxLevelString() { return 'MAX LEVEL'; }
        };
        
    function towerSelected(tower, buying) {
        if (tower) {
            if (selectedTower) selectedTower.showRadius(false);
            
            statPanel.style.visibility = 'visible';
            
            selectedTower = tower;
            selectedTower.showRadius(true);
            
            nameLabel.innerHTML = selectedTower.name;
            damageLabel.innerHTML = Math.floor(selectedTower.damage);
            radiusLabel.innerHTML = Math.floor(selectedTower.shootRadius);
            rateLabel.innerHTML = Math.floor(selectedTower.shootRate);
            upgradeLabel.innerHTML = Math.floor(selectedTower.upgradeCost);
            
            if (buying) {
                costTypeLabel.innerHTML = 'PRICE';
                buttons.style.visibility = 'hidden';
                costLabel.innerHTML = Math.floor(selectedTower.purchaseCost);
            } else {
                costTypeLabel.innerHTML = 'COST';
                buttons.style.visibility = 'visible';
                costLabel.innerHTML = Math.floor(selectedTower.sellCost);
                if (tower.canUpgrade()) {
                    rightButton.disabled = false;
                    rightButton.innerHTML = Constants.upgradeString;
                } else {
                    rightButton.disabled = true;
                    rightButton.innerHTML = Constants.maxLevelString;
                }
            }
        } else {
            if (selectedTower) {
                selectedTower.showRadius(false);
                selectedTower = undefined;
            }
            statPanel.style.visibility = 'hidden';
            buttons.style.visibility = 'hidden';
        }
    }
    
    return {
        /**
         * Shows the tower statistics in the Stats Panel
         * 
         * @param tower Tower that is selected
         * @param buying True if currently buying the tower
         */
        towerSelected: towerSelected,
        
        leftButtonPressed: function() {
            if (selectedTower) {
                var soldEffect = {
                    type: 'dollar',
                    center: selectedTower.center,
                    speed: {mean: 20, stdev: 2}, 
                    size: {mean: 25, stdev: 10},
                    lifetime: { mean: 0.75, stdev: 0.25},
                    particleCount: 10,
                    spint: true
                };
                FORTIFY.particles.createEffect(soldEffect);
                FORTIFY.model.towerSold(selectedTower);
            }
        },
        
        rightButtonPressed: function() {
            if (rightButton.innerHTML === Constants.upgradeString) {
                if (selectedTower) {
                    FORTIFY.model.upgradeTower(selectedTower);
                    towerSelected(selectedTower);
                }
            }
        },
        
        hide: function() {
            if (selectedTower) {
                selectedTower.showRadius(false);
            }
            statPanel.style.visibility = 'hidden';
        }
    };
})();
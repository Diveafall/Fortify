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
            statPanel.style.display = 'inline';
            
            selectedTower = tower;
            selectedTower.showRadius(true);
            
            nameLabel.innerHTML = selectedTower.name;
            damageLabel.innerHTML = Math.floor(selectedTower.damage);
            radiusLabel.innerHTML = Math.floor(selectedTower.shootRadius);
            rateLabel.innerHTML = Math.floor(selectedTower.shootRate);
            
            if (buying) {
                costTypeLabel.innerHTML = 'PRICE';
                buttons.style.display = 'none';
                costLabel.innerHTML = Math.floor(selectedTower.purchaseCost);
                
            } else {
                costTypeLabel.innerHTML = 'COST';
                buttons.style.display = 'table-row';
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
            statPanel.style.display = 'none';
            if (selectedTower) {
                selectedTower.showRadius(false);
                selectedTower = undefined;
            }
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
                statPanel.style.display = 'none';
            }
        },
        
        rightButtonPressed: function() {
            if (rightButton.innerHTML === Constants.upgradeString) {
                if (selectedTower) {
                    selectedTower.upgrade();
                    towerSelected(selectedTower);
                }
            }
        },
        
        hide: function() {
            if (selectedTower) {
                selectedTower.showRadius(false);
                selectedTower = undefined;
            }
            statPanel.style.display = 'none';
        }
    };
})();
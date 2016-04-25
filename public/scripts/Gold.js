FORTIFY.Gold = function() {
    var gold = 0, goldLabel = document.getElementById('gold-label');
    
    function refreshGoldLabel() {
        goldLabel.innerHTML = gold.toString();
    }
    
    function removeGold(amount) {
        if (gold - amount < 0) {
            return false;
        } else {
            gold -= amount;
            refreshGoldLabel();
            return true;
        }
    }
    
    function addGold(amount) {
        gold += amount;
        refreshGoldLabel();
    }
    
    return {
        addGold: addGold,
        removeGold: removeGold
    };
};
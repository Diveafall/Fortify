
FORTIFY.score = (function() {
    
    var scoreElement = document.getElementById('score-label'),
        score = 0,
        highscores = [],
        bonusPerLevel = 1000;
        
    function render() {
        scoreElement.innerHTML = score;
    }
    
    function get() {
        return score;
    }
    
    function add(toAdd) {
        score += toAdd;
    }
    
    // Towers: array of towers
    // Level: highest level reached
    function addEndGameScore(towers, level) {
        score += (level + 1) * bonusPerLevel;
        for (tower in towers) {
            score += (level + 1) * towers[tower].sellCost * 200;
        }
    }
    
    function reset() {
        score = 0;
    }
    
    function submit() {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function() {
            if (http.readyState === XMLHttpRequest.DONE) {
                console.log("Submitted score!");
                updateHighscores();
            }
        }
        http.open("GET", "/v1/scores/submit?score=" + score);
        http.send();
    }
    
    function updateHighscores() {
        var http = new XMLHttpRequest();
        http.onreadystatechange = function() {
            if (http.readyState === XMLHttpRequest.DONE) {
                highscores = JSON.parse(http.responseText);
            }
        }
        http.open("GET", "/v1/scores", true);
        http.send();
    }
    
    updateHighscores();

    function getHighscores() {
        return highscores;
    }
    
    return {
        render: render,
        get: get,
        add: add,
        addEndGameScore: addEndGameScore,
        reset: reset,
        submit: submit,
        getHighscores: getHighscores
    }
    
}());
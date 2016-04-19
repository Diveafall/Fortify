
FORTIFY.score = (function() {
    
    var scoreElement = document.getElementById('score-label'),
        score = 0;
        
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
        // TODO: add points for each towers, level 
    }
    
    function reset() {
        score = 0;
    }
    
    function send() {
        // TODO: send to server
    }
    
    function highscores() {
        // TODO: get highscores
    }
    
    return {
        render: render,
        get: get,
        add: add,
        addEndGameScore: addEndGameScore,
        reset: reset,
        send: send,
        highscores: highscores
    }
    
}());
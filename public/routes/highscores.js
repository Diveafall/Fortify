
var highscores = [];

exports.get = function(req, res) {
    res.writeHead(200, {'content-type': 'application/json'});
    res.end(JSON.stringify(highscores));
}

exports.submit = function(req, res) {
    var newScore = req.query.score;
    
    highscores.push(newScore);
    highscores.sort(function(a,b) {
        return b - a;
    });
    highscores = highscores.slice(0, 5);
    
    console.log("New highscores: ", highscores);
    
    res.writeHead(200);
    res.end();
}

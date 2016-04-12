FORTIFY.Clock = function(outputElement) {
    function timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }
    
    var begin, isActive = false, time = {}, output = outputElement;
    
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
            //output.innerHTML = time.minutes + (time.seconds < 10 ? ':0' : ':') + time.seconds;
        }
    };
};
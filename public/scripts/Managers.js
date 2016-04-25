FORTIFY.components.Managers = (function() {
    var ImageManager = (function() {
        var images = {};
        
        return {
            addImage: function(imageName, imageDir) {
                var newImage = new Image();
                newImage.src = imageDir;
                images[imageName] = newImage;
            },
            removeImage: function(imageName) {
                delete images[imageName];
            },
            getImage: function(imageName) {
                return images[imageName];
            }
        };
    })();
    
    ImageManager.addImage('background', 'assets/background.png');
    
    // BLASTOISE MEDIA
    ImageManager.addImage('blastoise-1', 'assets/turrets/blastoise/turret-2-1.png');
    ImageManager.addImage('blastoise-2', 'assets/turrets/blastoise/turret-2-2.png');
    ImageManager.addImage('blastoise-2', 'assets/turrets/blastoise/turret-2-3.png');
    
    // VULTURE MEDIA
    ImageManager.addImage('vulture-1', 'assets/turrets/vulture/turret-4-1.png');
    ImageManager.addImage('vulture-2', 'assets/turrets/vulture/turret-4-2.png');
    ImageManager.addImage('vulture-3', 'assets/turrets/vulture/turret-4-3.png');
    
    // SEISMIC MEDIA
    ImageManager.addImage('seismic-1', 'assets/turrets/seismic/turret-6-1.png');
    ImageManager.addImage('seismic-2', 'assets/turrets/seismic/turret-6-2.png');
    ImageManager.addImage('seismic-3', 'assets/turrets/seismic/turret-6-3.png');
    
    // TIMEWARP MEDIA
    ImageManager.addImage('timewarp-1', 'assets/turrets/timewarp/turret-5-1.png');
    ImageManager.addImage('timewarp-2', 'assets/turrets/timewarp/turret-5-2.png');
    ImageManager.addImage('timewarp-3', 'assets/turrets/timewarp/turret-5-3.png');
    
    var SoundManager = (function() {
        var sounds = {
            'blast': [
                document.getElementById('blast')
            ],
            'missile': [
                document.getElementById('missile')
            ],
            'explosion': [
                document.getElementById('explosion-1'),
                document.getElementById('explosion-2'),
                document.getElementById('explosion-3')
            ],
            'seismic': [
                document.getElementById('seismic')
            ],
            'buy': [
                document.getElementById('buy')
            ],
            'sold': [
                document.getElementById('sold')
            ],
            'death': [
                document.getElementById('death')
            ],
            'warp': [
                document.getElementById('warp')
            ],
            'no': [
                document.getElementById('no')
            ]
        }, soundsCurrentlyPlaying = [];
        
        return {
            addSound: function(soundName) {
                var newSound = document.getElementById(soundName);
                sounds[soundName] = newSound;
            },
            playSound: function(soundName, cancelOthers) {
                var index;
                
                if (sounds[soundName].length === 1) index = 0;
                else index = Math.floor(Math.random() * sounds[soundName].length);
                
                sounds[soundName][index].currentTime = 0;
                sounds[soundName][index].play();
            }
        };
    })();
    
    return {
        ImageManager: ImageManager,
        SoundManager: SoundManager
    };
}) ();
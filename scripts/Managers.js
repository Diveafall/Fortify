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
    
    return {
        ImageManager: ImageManager
    };
}) ();
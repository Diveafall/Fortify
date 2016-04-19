
FORTIFY.particles = (function() {
    
    var particles = {},
        nextName = 1,
        images = {
            fire: new Image(),
            smoke: new Image(),
            creep1: new Image()
        };
    
    images.fire.src = "assets/fire.png";
    images.smoke.src = "assets/smoke.png";
    images.creep1.src = "assets/creep1-blue-particle.png";
    
    // spec should have:
    // text
    // font '16px Arial'
    // center {x, y}
    // direction {x, y}
    // speed
    // size
    // lifetime
    function createText(spec) {
        spec.position = spec.center;
        spec.alive = 0;
        spec.spin = false;
        
        console.log(spec);
        
        particles[nextName++] = spec;
    }
    
    //spec should have:
    // type: fire/smoke
    // center: {x,y}
    // speed {mean, stdev}
    // lifetime {mean, stdev}
    // size {mean, stdev}
    // particleCount
    // spin true/false 
    function createEffect(spec) {
        
        for (var i = 0; i < spec.particleCount; i++) {
            var newParticle = {
                image: images[spec.type],
                center: spec.center,
                size: Random.nextGaussian(spec.size.mean, spec.size.stdev),
                direction: Random.nextCircleVector(),
                speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev),
                rotation: 0,
                spin: spec.spin,
                lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev),
                alive: 0
            };
            
            // Gaussian numbers can be negative
            newParticle.size = Math.max(1, newParticle.size);
            newParticle.lifetime = Math.max(0.01, newParticle.lifetime);
            
            particles[nextName++] = newParticle;
        }
    }
    
    function update(elapsedTime) {
        var removeMe = [],
			value,
			particle;
			
		//
		// We work with time in seconds, elapsedTime comes in as milliseconds
		elapsedTime = elapsedTime / 1000;
		
		for (value in particles) {
			if (particles.hasOwnProperty(value)) {
				particle = particles[value];
				//
				// Update how long it has been alive
				particle.alive += elapsedTime;
				
				//
				// Update its position
                var newX = particle.center.x + (elapsedTime * particle.speed * particle.direction.x);
				var newY = particle.center.y + (elapsedTime * particle.speed * particle.direction.y);
                particle.center = FORTIFY.Point(newX, newY);
				
				//
				// Rotate proportional to its speed
                if (particle.spin) {
				    particle.rotation += particle.speed / 500;
                }
				
				//
				// If the lifetime has expired, identify it for removal
				if (particle.alive > particle.lifetime) {
					removeMe.push(value);
				}
                particle.position = particle.center;
			}
		}

		//
		// Remove all of the expired particles
		for (particle = 0; particle < removeMe.length; particle++) {
			delete particles[removeMe[particle]];
		}
		removeMe.length = 0;
    }
    
    function render(graphics) {
        var value,
            particle;
        
        for (value in particles) {
            if (particles.hasOwnProperty(value)) {
                particle = particles[value];
                if (typeof particle.text === 'undefined') {
                    graphics.drawImage(particle);
                } else {
                    graphics.drawText(particle);
                }
                
            }
        }
    }
    
    return {
        createText: createText,
        createEffect: createEffect,
        update: update,
        render: render
    };
}());
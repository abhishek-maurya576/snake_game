class SoundManager {
    constructor() {
        this.sounds = {
            eat: new Audio('sounds/eat.mp3'),
            die: new Audio('sounds/die.mp3'),
            powerup: new Audio('sounds/powerup.mp3'),
            obstacle: new Audio('sounds/obstacle.mp3')
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }
}

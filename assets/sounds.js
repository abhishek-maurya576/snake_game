const sounds = {
    eat: new Audio('assets/eat.mp3'),
    gameOver: new Audio('assets/game-over.mp3'),
    levelUp: new Audio('assets/level-up.mp3')
};

// Play sound function
function playSound(sound) {
    if (sounds[sound]) {
        sounds[sound].currentTime = 0;
        sounds[sound].play();
    }
}

export { playSound };

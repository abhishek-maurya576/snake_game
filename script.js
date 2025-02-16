import { playSound } from './assets/sounds.js';

const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = 20;
canvas.width = gridSize * tileCount;
canvas.height = gridSize * tileCount;

let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let direction = {x: 0, y: 0};
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameSpeed = 100;
let gameRunning = true;
let currentLevel = 1;
const levels = [
    { speed: 150, obstacles: 0 },
    { speed: 120, obstacles: 2 },
    { speed: 110, obstacles: 4 },
    { speed: 100, obstacles: 6 },
    { speed: 80, obstacles: 8 },
    { speed: 60, obstacles: 10 },
    { speed: 40, obstacles: 12 }
];
let obstacles = [];

document.getElementById('high-score').textContent = highScore;

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    setTimeout(gameLoop, gameSpeed);
}

function update() {
    // If snake is not moving, don't update
    if (direction.x === 0 && direction.y === 0) {
        return;
    }

    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    
    // Check collision with walls
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check collision with self (only if snake length > 1)
    if (snake.length > 1 && snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Check collision with obstacles
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        gameOver();
        return;
    }
    
    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        playSound('eat');
        score++;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            document.getElementById('high-score').textContent = highScore;
        }
        document.getElementById('score').textContent = score;
        
        // Level progression
        if (score % 5 === 0 && currentLevel < levels.length) {
            currentLevel++;
            gameSpeed = levels[currentLevel - 1].speed;
            playSound('levelUp');
            generateObstacles();
        }
        generateFood();
    } else {
        snake.pop();
    }
    
    snake.unshift(head);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw obstacles
    ctx.fillStyle = '#666';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
    });
    
    // Draw snake
    ctx.fillStyle = '#4CAF50';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
    
    // Draw food
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function generateObstacles() {
    obstacles = [];
    const numObstacles = levels[currentLevel - 1].obstacles;
    for (let i = 0; i < numObstacles; i++) {
        let obstacle;
        do {
            obstacle = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (snake.some(segment => segment.x === obstacle.x && segment.y === obstacle.y) ||
                (obstacle.x === food.x && obstacle.y === food.y));
        obstacles.push(obstacle);
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Ensure food doesn't spawn on snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    }
}

let gameLoopTimeout;

function gameOver() {
    playSound('gameOver');
    gameRunning = false;
    gameLoopRunning = false;
    
    if (gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
    }

    // Create ripple effect from collision point
    const head = snake[0];
    const rippleX = head.x * gridSize;
    const rippleY = head.y * gridSize;
    
    let radius = 0;
    const maxRadius = Math.max(canvas.width, canvas.height);
    const rippleSpeed = 5;
    const rippleEffect = setInterval(() => {
        // Clear canvas
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw obstacles
        ctx.fillStyle = '#666';
        obstacles.forEach(obstacle => {
            ctx.fillRect(obstacle.x * gridSize, obstacle.y * gridSize, gridSize, gridSize);
        });
        
        // Draw snake in red to indicate death
        ctx.fillStyle = '#ff0000';
        snake.forEach(segment => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
        
        // Draw expanding ripple
        ctx.beginPath();
        ctx.arc(rippleX + gridSize/2, rippleY + gridSize/2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 0, ${1 - radius/maxRadius})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw shockwave
        ctx.beginPath();
        ctx.arc(rippleX + gridSize/2, rippleY + gridSize/2, radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - radius/maxRadius})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        radius += rippleSpeed;
        
        if (radius > maxRadius) {
            clearInterval(rippleEffect);
            // Show game over message
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#fff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 50);
            
            ctx.font = '24px Arial';
            ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 10);
            
            setTimeout(() => {
                resetGame();
            }, 2000);
        }
    }, 16);
}

function resetGame() {
    const centerX = Math.floor(tileCount / 2);
    const centerY = Math.floor(tileCount / 2);
    snake = [{x: centerX, y: centerY}];
    direction = {x: 0, y: 0};
    score = 0;
    currentLevel = 1;
    gameSpeed = levels[0].speed;
    document.getElementById('score').textContent = score;
    
    // Generate food first
    generateFood();
    
    // Generate obstacles away from snake
    obstacles = [];
    if (currentLevel > 1) {
        const numObstacles = levels[currentLevel - 1].obstacles;
        for (let i = 0; i < numObstacles; i++) {
            let obstacle;
            do {
                obstacle = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            } while (
                // Keep obstacles away from snake start position
                (Math.abs(obstacle.x - centerX) < 3 && Math.abs(obstacle.y - centerY) < 3) ||
                // Keep obstacles away from food
                (obstacle.x === food.x && obstacle.y === food.y)
            );
            obstacles.push(obstacle);
        }
    }
    
    gameRunning = true;
    // Clear any existing game loop
    if (gameLoopTimeout) {
        clearTimeout(gameLoopTimeout);
    }
    // Start new game loop only if not already running
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        gameLoopTimeout = setTimeout(gameLoop, gameSpeed);
    }
}

// Mobile controls
document.querySelector('.mobile-btn.up').addEventListener('click', () => {
    if (direction.y === 0) direction = {x: 0, y: -1};
});
document.querySelector('.mobile-btn.down').addEventListener('click', () => {
    if (direction.y === 0) direction = {x: 0, y: 1};
});
document.querySelector('.mobile-btn.left').addEventListener('click', () => {
    if (direction.x === 0) direction = {x: -1, y: 0};
});
document.querySelector('.mobile-btn.right').addEventListener('click', () => {
    if (direction.x === 0) direction = {x: 1, y: 0};
});

// Keyboard controls
window.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = {x: 0, y: -1};
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = {x: 0, y: 1};
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = {x: -1, y: 0};
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = {x: 1, y: 0};
            break;
    }
});

// Pause button
document.getElementById('pause-btn').addEventListener('click', () => {
    gameRunning = !gameRunning;
    if (gameRunning) {
        gameLoop();
        document.getElementById('pause-btn').textContent = 'Pause';
    } else {
        document.getElementById('pause-btn').textContent = 'Resume';
    }
});

// Initialize game state
let gameInitialized = false;
let gameLoopRunning = false;

// Start button
document.getElementById('start-btn').addEventListener('click', () => {
    if (!gameInitialized) {
        generateObstacles();
        resetGame();
        gameLoop();
        gameInitialized = true;
        gameLoopRunning = true;
        document.getElementById('start-btn').textContent = 'Restart Game';
    } else {
        resetGame();
        if (!gameLoopRunning) {
            gameLoop();
            gameLoopRunning = true;
        }
    }
});

// Initialize game board
generateFood();
generateObstacles();

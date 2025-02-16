class Game {
    constructor() {
        this.grid = this.createGrid();
        this.snake = new Snake();
        this.food = this.spawnFood();
        this.score = 0;
        this.gameOver = false;
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.soundManager = new SoundManager();
        this.highScore = localStorage.getItem('highScore') || 0;
        this.difficulty = 'normal';
        this.powerUp = null;
        this.powerUpTimer = 0;
        this.powerUpActive = false;
        
        this.difficultySettings = {
            easy: { speed: 150, obstacleFrequency: 60 },
            normal: { speed: 100, obstacleFrequency: 40 },
            hard: { speed: 70, obstacleFrequency: 20 }
        };
    }

    setDifficulty(level) {
        this.difficulty = level;
        this.updateGameSpeed();
    }

    updateGameSpeed() {
        const settings = this.difficultySettings[this.difficulty];
        this.gameSpeed = settings.speed;
        this.obstacleFrequency = settings.obstacleFrequency;
    }

    update() {
        if (this.gameOver) return;

        this.snake.move();
        if (this.snake.collidesWith(this.food)) {
            this.soundManager.play('eat');
            this.snake.grow();
            this.food = this.spawnFood();
            this.score += this.powerUpActive && this.powerUp.type === 'double_score' ? 2 : 1;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('highScore', this.highScore);
            }
        }

        if (this.snake.collidesWithSelf() || this.snake.collidesWithWall(this.grid)) {
            this.gameOver = true;
            this.soundManager.play('die');
        }

        // Update obstacles
        this.obstacleTimer--;
        if (this.obstacleTimer <= 0) {
            const obstacle = new Obstacle();
            obstacle.spawn(this.grid, this.snake);
            this.obstacles.push(obstacle);
            this.obstacleTimer = Math.floor(Math.random() * 50) + 30;
        }

        this.obstacles = this.obstacles.filter(obstacle => {
            if (this.snake.collidesWith(obstacle.position)) {
                this.gameOver = true;
                return false;
            }
            return obstacle.update();
        });

        // Power-up spawning
        if (!this.powerUp && Math.random() < 0.01) {
            this.powerUp = new PowerUp();
            this.powerUp.spawn(this.grid, this.snake);
        }

        // Power-up collection
        if (this.powerUp && this.snake.collidesWith(this.powerUp.position)) {
            this.soundManager.play('powerup');
            this.activatePowerUp(this.powerUp.type);
            this.powerUp = null;
        }

        // Power-up duration
        if (this.powerUpActive) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) {
                this.deactivatePowerUp();
            }
        }
    }

    activatePowerUp(type) {
        this.powerUpActive = true;
        this.powerUpTimer = 200;
        switch(type) {
            case 'speed':
                this.gameSpeed *= 0.5;
                break;
            case 'invincible':
                this.snake.isInvincible = true;
                break;
            case 'double_score':
                // Already handled in score calculation
                break;
        }
    }

    deactivatePowerUp() {
        this.powerUpActive = false;
        this.updateGameSpeed();
        this.snake.isInvincible = false;
    }

    draw() {
        this.clearCanvas();
        this.drawGrid();
        this.drawSnake();
        this.drawFood();

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            ctx.fillStyle = `rgba(255, 0, 0, ${obstacle.lifespan / 100})`;
            ctx.beginPath();
            ctx.arc(
                obstacle.position.x * this.cellSize + this.cellSize/2,
                obstacle.position.y * this.cellSize + this.cellSize/2,
                this.cellSize/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // Draw power-up if exists
        if (this.powerUp) {
            this.powerUp.draw(ctx, this.cellSize);
        }

        this.drawScore();

        // Draw high score
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`High Score: ${this.highScore}`, 10, 60);
        
        // Draw active power-up indicator
        if (this.powerUpActive) {
            ctx.fillStyle = 'yellow';
            ctx.fillText(`Power-up: ${this.powerUp.type} (${this.powerUpTimer})`, 10, 90);
        }
    }
}

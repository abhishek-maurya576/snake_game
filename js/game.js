class Game {
    constructor() {
        this.grid = this.createGrid();
        this.snake = new Snake();
        this.food = this.spawnFood();
        this.score = 0;
        this.gameOver = false;
        this.obstacles = [];
        this.obstacleTimer = 0;
    }

    update() {
        if (this.gameOver) return;

        this.snake.move();
        if (this.snake.collidesWith(this.food)) {
            this.snake.grow();
            this.food = this.spawnFood();
            this.score++;
        }

        if (this.snake.collidesWithSelf() || this.snake.collidesWithWall(this.grid)) {
            this.gameOver = true;
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

        this.drawScore();
    }
}

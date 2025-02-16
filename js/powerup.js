class PowerUp {
    constructor() {
        this.position = null;
        this.type = null;
        this.duration = 0;
        this.active = false;
    }

    spawn(grid, snake) {
        let validPosition = false;
        while (!validPosition) {
            this.position = {
                x: Math.floor(Math.random() * grid.width),
                y: Math.floor(Math.random() * grid.height)
            };
            validPosition = !snake.collidesWith(this.position);
        }
        
        this.type = this.getRandomType();
        this.duration = 200;
    }

    getRandomType() {
        const types = ['speed', 'invincible', 'double_score'];
        return types[Math.floor(Math.random() * types.length)];
    }

    draw(ctx, cellSize) {
        const colors = {
            speed: '#00ff00',
            invincible: '#ff0000',
            double_score: '#ffff00'
        };

        ctx.fillStyle = colors[this.type];
        ctx.beginPath();
        ctx.arc(
            this.position.x * cellSize + cellSize/2,
            this.position.y * cellSize + cellSize/2,
            cellSize/3,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

class Obstacle {
    constructor() {
        this.position = null;
        this.lifespan = 0;
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
        this.lifespan = Math.floor(Math.random() * 100) + 50;
    }

    update() {
        this.lifespan--;
        return this.lifespan > 0;
    }
}

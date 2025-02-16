class Snake {
    constructor(x, y) {
        this.segments = [{x, y}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.previousPositions = [];
    }

    update() {
        // Save previous positions for smooth movement
        this.previousPositions.unshift({...this.segments[0]});
        if (this.previousPositions.length > this.segments.length) {
            this.previousPositions.pop();
        }

        // Update head position
        const head = this.segments[0];
        this.direction = this.nextDirection;
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Update body segments
        for (let i = 1; i < this.segments.length; i++) {
            this.segments[i] = {...this.previousPositions[i - 1]};
        }
    }

    draw(ctx, cellSize) {
        // Draw snake body with gradient effect
        this.segments.forEach((segment, index) => {
            const alpha = 1 - (index / this.segments.length * 0.6);
            ctx.fillStyle = `rgba(0, 200, 0, ${alpha})`;
            ctx.beginPath();
            ctx.arc(
                segment.x * cellSize + cellSize/2,
                segment.y * cellSize + cellSize/2,
                cellSize/2 * (1 - index/this.segments.length * 0.3),
                0,
                Math.PI * 2
            );
            ctx.fill();
        });

        // Draw snake eyes
        const head = this.segments[0];
        const eyeSize = cellSize/6;
        ctx.fillStyle = 'white';
        
        // Eye positions based on direction
        const eyePositions = this.getEyePositions(head, cellSize);
        eyePositions.forEach(pos => {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    getEyePositions(head, cellSize) {
        const baseX = head.x * cellSize + cellSize/2;
        const baseY = head.y * cellSize + cellSize/2;
        const offset = cellSize/3;
        
        switch(this.direction) {
            case 'up': return [
                {x: baseX - offset/2, y: baseY - offset},
                {x: baseX + offset/2, y: baseY - offset}
            ];
            case 'down': return [
                {x: baseX - offset/2, y: baseY + offset},
                {x: baseX + offset/2, y: baseY + offset}
            ];
            case 'left': return [
                {x: baseX - offset, y: baseY - offset/2},
                {x: baseX - offset, y: baseY + offset/2}
            ];
            case 'right': return [
                {x: baseX + offset, y: baseY - offset/2},
                {x: baseX + offset, y: baseY + offset/2}
            ];
        }
    }

    collidesWith(position) {
        return this.segments.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
}

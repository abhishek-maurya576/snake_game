class Snake {
    constructor(x, y) {
        this.segments = [{x, y}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.previousPositions = [];
        this.smoothPositions = [];  // Store interpolated positions
        this.isBlinking = false;
        this.blinkTimer = Math.random() * 100;
        this.bodyColor = {
            r: 0,
            g: 200,
            b: 0
        };
    }

    update() {
        // Handle eye blinking
        this.blinkTimer--;
        if (this.blinkTimer <= 0) {
            this.isBlinking = !this.isBlinking;
            this.blinkTimer = this.isBlinking ? 5 : Math.random() * 100 + 50;
        }

        // Store current position for smooth movement
        const headPos = {...this.segments[0]};
        this.previousPositions.unshift(headPos);
        if (this.previousPositions.length > this.segments.length * 3) {
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

        // Calculate smooth positions for body segments
        this.smoothPositions = [];
        for (let i = 0; i < this.segments.length; i++) {
            const targetIndex = i * 3;
            if (this.previousPositions[targetIndex]) {
                const smooth = {
                    x: this.previousPositions[targetIndex].x,
                    y: this.previousPositions[targetIndex].y
                };
                this.smoothPositions.push(smooth);
            } else {
                this.smoothPositions.push({...this.segments[i]});
            }
        }
    }

    draw(ctx, cellSize) {
        // Draw body segments with gradient and smooth curves
        this.smoothPositions.forEach((segment, index) => {
            const radiusMultiplier = 1 - (index / this.segments.length * 0.3);
            const alpha = 1 - (index / this.segments.length * 0.5);
            
            // Main body gradient
            ctx.fillStyle = `rgba(${this.bodyColor.r}, ${this.bodyColor.g}, ${this.bodyColor.b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(
                segment.x * cellSize + cellSize/2,
                segment.y * cellSize + cellSize/2,
                cellSize/2 * radiusMultiplier,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Add highlight effect
            const highlightRadius = cellSize/2 * radiusMultiplier * 0.7;
            const gradient = ctx.createRadialGradient(
                segment.x * cellSize + cellSize/3,
                segment.y * cellSize + cellSize/3,
                0,
                segment.x * cellSize + cellSize/2,
                segment.y * cellSize + cellSize/2,
                highlightRadius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();
        });

        // Draw eyes only if not blinking
        if (!this.isBlinking) {
            this.drawEyes(ctx, cellSize);
        }
    }

    drawEyes(ctx, cellSize) {
        const head = this.smoothPositions[0];
        const eyeBasePositions = this.getEyeBasePositions(head, cellSize);

        eyeBasePositions.forEach(basePos => {
            // Draw eye white
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(basePos.x, basePos.y, cellSize/5, 0, Math.PI * 2);
            ctx.fill();

            // Draw pupil with direction-based offset
            const pupilOffset = this.getPupilOffset(cellSize/8);
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(
                basePos.x + pupilOffset.x,
                basePos.y + pupilOffset.y,
                cellSize/8,
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Add eye shine
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(
                basePos.x + pupilOffset.x + cellSize/16,
                basePos.y + pupilOffset.y - cellSize/16,
                cellSize/20,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    }

    getPupilOffset(baseOffset) {
        switch(this.direction) {
            case 'up': return { x: 0, y: -baseOffset/2 };
            case 'down': return { x: 0, y: baseOffset/2 };
            case 'left': return { x: -baseOffset/2, y: 0 };
            case 'right': return { x: baseOffset/2, y: 0 };
            default: return { x: 0, y: 0 };
        }
    }

    getEyeBasePositions(head, cellSize) {
        const baseX = head.x * cellSize + cellSize/2;
        const baseY = head.y * cellSize + cellSize/2;
        const offset = cellSize/3;
        
        switch(this.direction) {
            case 'up':
                return [
                    { x: baseX - offset/2, y: baseY - offset/2 },
                    { x: baseX + offset/2, y: baseY - offset/2 }
                ];
            case 'down':
                return [
                    { x: baseX - offset/2, y: baseY + offset/2 },
                    { x: baseX + offset/2, y: baseY + offset/2 }
                ];
            case 'left':
                return [
                    { x: baseX - offset/2, y: baseY - offset/2 },
                    { x: baseX - offset/2, y: baseY + offset/2 }
                ];
            case 'right':
                return [
                    { x: baseX + offset/2, y: baseY - offset/2 },
                    { x: baseX + offset/2, y: baseY + offset/2 }
                ];
            default:
                return [];
        }
    }

    collidesWith(position) {
        return this.segments.some(segment => 
            segment.x === position.x && segment.y === position.y
        );
    }
}

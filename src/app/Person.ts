import { Motion } from './Motion';

export class Person {
    private MAX_SPEED = 2;
    private MAX_ACCELERATION = 1;
    
    public motion: Motion;

    constructor(public id: number, public x: number, public y: number) {
        const vx = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_SPEED;
        const vy = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_SPEED;
        const dvx = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
        const dvy = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
        this.motion = new Motion(vx, vy, dvx, dvy);
    }

    public updatePosition() {
        this.x += this.motion.vx;
        this.y += this.motion.vy;
    }

    public updateVelocity() {
        this.motion.vx += this.motion.dvx;
        this.motion.vx = Math.max(this.motion.vx, -1 * this.MAX_SPEED);
        this.motion.vx = Math.min(this.motion.vx, this.MAX_SPEED);
        
        this.motion.vy += this.motion.dvy;
        this.motion.vy = Math.max(this.motion.vy, -1 * this.MAX_SPEED);
        this.motion.vy = Math.min(this.motion.vy, this.MAX_SPEED);
    }

    public updateAcceleration() {
        this.motion.dvx += ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
        this.motion.dvy += ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
    }

    public hitWall(side: string) {
        if((['top', 'bottom'].indexOf(side) > -1)) { this.motion.vy *= -1; }
        if((['left', 'right'].indexOf(side) > -1)) { this.motion.vx *= -1; }

        if((['top', 'bottom'].indexOf(side) > -1)) { this.motion.dvy *= -1; }
        if((['left', 'right'].indexOf(side) > -1)) { this.motion.dvx *= -1; }
    }
}
import { Motion } from './Motion';

import { DAYS_TO_RECOVER } from './visualization.component'
import { Quarentine } from './quarentin-level.interface';

export const enum InfectionStatus {
    HEALTHY,
    CONTAGIOUS,
    IMMUNE
};

export class Person {
    private MAX_SPEED = 2;
    private MAX_ACCELERATION = 1;
    
    public motion: Motion;
    private infectionDay;

    constructor(public id: number, public x: number, public y: number, private speedId: number, private motionId: number, public infectionStatus: InfectionStatus = InfectionStatus.HEALTHY) {
        const vx = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_SPEED;
        const vy = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_SPEED;
        const dvx = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
        const dvy = ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
        this.motion = new Motion(vx, vy, dvx, dvy, speedId, motionId);
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

    public quarentine(quarentine: Quarentine, numberOfPeople: number) {
        // If quarantine percentageMoving = 80%, you want to stop anybody with a motionId greater than (0.8 * NUMBER_OF_PEOPLE)


        this.motion.vx = quarentine.speedFactor * this.motion.vx;
        this.motion.vy = quarentine.speedFactor * this.motion.vy;
        this.motion.vx = quarentine.speedFactor * this.motion.vx;
        this.motion.vy = quarentine.speedFactor * this.motion.vy;

        this.motion.vx = (this.motion.speedId > quarentine.percentageMoving * numberOfPeople) ? 0: this.motion.vx;
        this.motion.vy = (this.motion.speedId > quarentine.percentageMoving * numberOfPeople) ? 0: this.motion.vy;
        this.motion.vx = (this.motion.speedId > quarentine.percentageMoving * numberOfPeople) ? 0: this.motion.vx;
        this.motion.vy = (this.motion.speedId > quarentine.percentageMoving * numberOfPeople) ? 0: this.motion.vy;
        
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

    public infect(friend: Person, infectionDay: number) {
        if(friend.infectionStatus === InfectionStatus.IMMUNE) { return; }

        if(this.infectionStatus === InfectionStatus.CONTAGIOUS) {
            friend.infectionStatus = InfectionStatus.CONTAGIOUS;
            friend.infectionDay = infectionDay;
        }
    }

    public recover(dayId) {
        if(!this.infectionDay) { return; }

        if((dayId - this.infectionDay) > DAYS_TO_RECOVER) {
            this.infectionStatus = InfectionStatus.IMMUNE;
        }
    }
}
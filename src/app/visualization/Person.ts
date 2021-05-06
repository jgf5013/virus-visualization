import { Motion } from './Motion';

import { DAYS_TO_RECOVER } from '../app.constants';
import { Quarantine } from '../quarantine-level.interface';

export const enum InfectionStatus {
    HEALTHY,
    CONTAGIOUS,
    IMMUNE,
    DEAD
};

export class Person {
    private MAX_SPEED = 2;
    private MAX_ACCELERATION = 1;
    
    public motion: Motion;
    public infectionDay;
    public alive: boolean = true;

    public INFECTION_RATE = 0.2;

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

    public quarantine(quarantine: Quarantine, numberOfPeople: number) {
        // If quarantine percentageMoving = 80%, you want to stop anybody with a motionId greater than (0.8 * NUMBER_OF_PEOPLE)


        this.motion.vx = quarantine.speedFactor * this.motion.vx;
        this.motion.vy = quarantine.speedFactor * this.motion.vy;
        this.motion.vx = quarantine.speedFactor * this.motion.vx;
        this.motion.vy = quarantine.speedFactor * this.motion.vy;

        this.motion.vx = (this.motion.speedId > quarantine.percentageMoving * numberOfPeople) ? 0: this.motion.vx;
        this.motion.vy = (this.motion.speedId > quarantine.percentageMoving * numberOfPeople) ? 0: this.motion.vy;
        this.motion.vx = (this.motion.speedId > quarantine.percentageMoving * numberOfPeople) ? 0: this.motion.vx;
        this.motion.vy = (this.motion.speedId > quarantine.percentageMoving * numberOfPeople) ? 0: this.motion.vy;
        
    }

    public updateAcceleration() {
        this.motion.dvx += ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
        this.motion.dvy += ((Math.random() > 0.5) ? 1 : -1) * Math.random() * this.MAX_ACCELERATION;
    }

    public hitWall(side: string) {
        switch(side) {
            case 'top':
                this.motion.vy = Math.abs(this.motion.vy);
                this.motion.dvy = Math.abs(this.motion.dvy);
                break;
            case 'bottom':
                this.motion.vy = -Math.abs(this.motion.vy);
                this.motion.dvy = -Math.abs(this.motion.dvy);
                break;
            case 'left':
                this.motion.vx = Math.abs(this.motion.vx);
                this.motion.dvx = Math.abs(this.motion.dvx);
                break;
            case 'right':
                this.motion.vx = -Math.abs(this.motion.vx);
                this.motion.dvx = -Math.abs(this.motion.dvx);
                break;
        }
    }

    public infect(friend: Person, infectionDay: number = 0) {
        // Only infect the healthy people...
        if(friend.infectionStatus !== InfectionStatus.HEALTHY) { return; }

        if(Math.random() < this.INFECTION_RATE) { return; }

        if(this.infectionStatus === InfectionStatus.CONTAGIOUS) {
            friend.infectionStatus = InfectionStatus.CONTAGIOUS;
            friend.infectionDay = infectionDay;
        }
    }

    public recover(dayId) {
        if(this.infectionDay === null) { return; }

        if((dayId - this.infectionDay) > DAYS_TO_RECOVER) {
            this.infectionStatus = InfectionStatus.IMMUNE;
        }
    }

    public die() {
        this.infectionStatus = InfectionStatus.DEAD;
    }
}
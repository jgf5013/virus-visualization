export class Motion {
    constructor(
        public vx: number, public vy: number, public dvx: number, public dvy: number,
        public speedId: number, public motionId: number) {
    }
}
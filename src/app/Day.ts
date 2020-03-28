export class Day {
    public numHealthy: number;
    public numContagious: number;
    public numImmune: number;
    public numDead: number;

    constructor(public id: number, public collisions: number, public frames: number, public numPeople: number) {
    }

    setStats(numHealthy: number, numContagious: number, numImmune: number, numDead: number) {
        this.numHealthy = numHealthy;
        this.numContagious = numContagious;
        this.numImmune = numImmune;
        this.numDead = numDead;
    }

}
export const QuarentineLevels = {
    NONE: {level: null, mode: "NONE", speedFactor: 1.0, percentageMoving: 1.0},
    MEDIUM: {level: 1, mode: "MEDIUM", speedFactor: 0.75, percentageMoving: 0.75},
    HIGH: {level: 2, mode: "HIGH", speedFactor: 0.5, percentageMoving: 0.5},
    LOCKDOWN: {level: 3, mode: "LOCKDOWN", speedFactor: 0.9, percentageMoving: 0.1}
}

export interface Quarentine {
    level: number | null;
    mode: string;
    speedFactor: number;
    percentageMoving: number;
}
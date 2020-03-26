import { Day } from './Day';

export interface VisualizationState {
    dayHistory: Day[];
    daysPassed: number;
    recovered: boolean;
}

export const VisualizationColors = {
    RED: {rgbaString: 'rgba(200,100,100,1.0)'},
    GREEN: {rgbaString: 'rgba(100,200,150,0.9)'},
    BLUE: {rgbaString: 'rgba(0,100,250,0.7)'},
    GREY: {rgbaString: 'rgba(100,100,100,0.7)'}
}

export interface Color {
    rgbaString: string;
}


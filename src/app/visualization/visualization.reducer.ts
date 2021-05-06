
import { Action, createReducer, on } from '@ngrx/store';
import * as VisualizationActions from './visualization.actions';
import { VisualizationState } from './visualization.interface';

export const initialVisualizationState: VisualizationState = {
    dayHistory: [],
    daysPassed: 0,
    recovered: false,
    playCounter: 0
};

export const VISUALIZATION_FEATURE_KEY = 'visualizationState';

const MAX_DAY_HISTORY: number = 25;

const visualizationReducer = createReducer(
  initialVisualizationState,
  on(VisualizationActions.CaptureDay, (state: VisualizationState, payload) => {
    const dayHistory = [...state.dayHistory, payload.day];
    if(dayHistory.length > MAX_DAY_HISTORY) { dayHistory.shift(); }

    return ({ ...state, dayHistory: dayHistory, daysPassed: state.daysPassed + 1 });
  }),
  on(VisualizationActions.PopulationRecovered, (state: VisualizationState) => {

    return ({ ...state, recovered: true});
  }),
  on(VisualizationActions.Reset, (state: VisualizationState) => {

    return ({ ...initialVisualizationState, playCounter: state.playCounter + 1});
  })
);

export function reducer(state: VisualizationState | undefined, action: Action) {
  return visualizationReducer(state, action);
}
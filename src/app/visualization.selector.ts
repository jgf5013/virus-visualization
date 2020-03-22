import { createSelector, createFeatureSelector } from '@ngrx/store';

import { VisualizationState } from './visualization.interface';
import { AppState } from './app.interface';

import * as fromVisualization from './visualization.reducer';

export const selectVisualization = createFeatureSelector<AppState, VisualizationState>(fromVisualization.VISUALIZATION_FEATURE_KEY);

export const selectDayHistory = createSelector(
    selectVisualization,
    (state: VisualizationState) => state.dayHistory
);
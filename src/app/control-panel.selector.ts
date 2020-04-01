import { createSelector, createFeatureSelector } from '@ngrx/store';

import { ControlPanelState } from './control-panel.interface';
import { AppState } from './app.interface';

import * as fromControlPanel from './control-panel.reducer';

export const selectControlPanel = createFeatureSelector<AppState, ControlPanelState>(fromControlPanel.CONTROL_PANEL_FEATURE_KEY);

export const selectQuarantineMode = createSelector(
    selectControlPanel,
    (state: ControlPanelState) => state.quarentine
);
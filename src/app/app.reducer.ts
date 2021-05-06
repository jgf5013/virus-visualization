import { AppState } from './app.interface';

import * as fromVisualization from './visualization/visualization.reducer';
import * as fromControlPanel from './control-panel/control-panel.reducer';
import { Action } from '@ngrx/store';

const initialState: AppState = {
  visualizationState: fromVisualization.initialVisualizationState,
  controlPanelState: fromControlPanel.initialControlPanelState
};

export function AppReducer(state = initialState, action: Action){
  switch(action.type) {
    default:
      return state;
  }
}
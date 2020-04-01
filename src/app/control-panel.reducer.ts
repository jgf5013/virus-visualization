
import * as ControlPanelActions from './control-panel.actions';
import { createReducer, on, Action } from '@ngrx/store';
import { ControlPanelState } from './control-panel.interface';
import { QuarantineLevels } from './quarentin-level.interface';

export const initialControlPanelState: ControlPanelState = {
    quarentine: QuarantineLevels.NONE
};

export const CONTROL_PANEL_FEATURE_KEY = 'controlPanelState';


const controlPanelReducer = createReducer(
    initialControlPanelState,
  on(ControlPanelActions.ChangeControls, (state: ControlPanelState, payload: any) => {
    return ({ ...state, quarentine: payload.quarentine });
  })
);

export function reducer(state: ControlPanelState | undefined, action: Action) {
  return controlPanelReducer(state, action);
}
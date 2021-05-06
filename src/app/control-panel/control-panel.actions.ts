import { Action } from '@ngrx/store';

import { ControlPanelState } from './control-panel.interface';


import { createAction, props } from '@ngrx/store';

export const ChangeControls = createAction('[ControlPanel] ChangeControls', props<ControlPanelState>());
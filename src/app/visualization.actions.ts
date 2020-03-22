import { Action } from '@ngrx/store';

import { Day } from './Day';



import { createAction, props } from '@ngrx/store';

export const CaptureDay = createAction('[Visualization] CaptureDay', props<{day: Day}>());
export const Reset = createAction('[Visualization] Reset');
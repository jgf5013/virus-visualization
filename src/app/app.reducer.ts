import { AppState } from './app.interface';

import * as fromVisualization from './visualization.reducer';

const initialState: AppState = {
  visualizationState: fromVisualization.initialVisualizationState
};

export function AppReducer(state = initialState, action: productListActions.ProductListActions){
  switch(action.type) {
    default:
      return state;
  }
}
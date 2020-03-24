import { VisualizationState } from './visualization.interface';
import { ControlPanelState } from './control-panel.interface';


export interface AppState {
  visualizationState: VisualizationState;
  controlPanelState: ControlPanelState;
}
import { VisualizationState } from './visualization/visualization.interface';
import { ControlPanelState } from './control-panel/control-panel.interface';


export interface AppState {
  visualizationState: VisualizationState;
  controlPanelState: ControlPanelState;
}
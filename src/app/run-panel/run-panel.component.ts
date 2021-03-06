import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.interface';
import { Store, select } from '@ngrx/store';
import { selectVisualization } from '../visualization/visualization.selector';
import { VisualizationState } from '../visualization/visualization.interface';
import { Day } from '../visualization/Day';
import { Reset } from '../visualization/visualization.actions';

@Component({
  selector: 'run-panel',
  templateUrl: './run-panel.component.html',
  styleUrls: ['./run-panel.component.scss']
})
export class RunPanelComponent {

  numberDead: number = 0;
  constructor(private store: Store<AppState>, private visualizationState: Store<VisualizationState>) {
    
      this.store.pipe(select(selectVisualization))
      .subscribe((visualizationState: VisualizationState) => {
        if(!visualizationState.dayHistory.length) { return; }
        const latestDay: Day = visualizationState.dayHistory[visualizationState.dayHistory.length - 1];
        this.numberDead = latestDay.numDead;
      });
  }


  reset() {
    this.visualizationState.dispatch(Reset());
  }

}

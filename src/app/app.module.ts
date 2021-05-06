import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';


import { MaterialModule } from './material/material.module';
import { AppComponent } from './app.component';
import { VisualizationComponent } from './visualization/visualization.component';
import { StatsDashboardComponent } from './stats-dashboard/stats-dashboard.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import * as fromVisualization from './visualization/visualization.reducer';
import * as fromControlPanel from './control-panel/control-panel.reducer';
import { InformationPanelComponent } from './information-panel/information-panel.component';
import { RunPanelComponent } from './run-panel/run-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    VisualizationComponent,
    StatsDashboardComponent,
    ControlPanelComponent,
    InformationPanelComponent,
    RunPanelComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({}),
    StoreModule.forFeature(fromVisualization.VISUALIZATION_FEATURE_KEY, fromVisualization.reducer),
    StoreModule.forFeature(fromControlPanel.CONTROL_PANEL_FEATURE_KEY, fromControlPanel.reducer),
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

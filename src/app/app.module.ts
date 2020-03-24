import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StoreModule } from '@ngrx/store';


import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { VisualizationComponent } from './visualization.component';
import { StatsDashboardComponent } from './stats-dashboard.component';
import { ControlPanelComponent } from './control-panel.component';
import * as fromVisualization from './visualization.reducer';
import * as fromControlPanel from './control-panel.reducer';

@NgModule({
  declarations: [
    AppComponent,
    VisualizationComponent,
    StatsDashboardComponent,
    ControlPanelComponent
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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { VisualizationComponent } from './visualization.component';
import { StatsDashboardComponent } from './stats-dashboard.component';
import { StoreModule } from '@ngrx/store';
import { ControlPanelComponent } from './control-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    VisualizationComponent,
    StatsDashboardComponent,
    ControlPanelComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({}, {})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

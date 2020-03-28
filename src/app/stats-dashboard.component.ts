import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Store, select } from '@ngrx/store';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { VisualizationState, VisualizationColors } from './visualization.interface';
import { ControlPanelState } from './control-panel.interface';
import { selectDayHistory, selectVisualization } from './visualization.selector';
import { Day } from './Day';
import { AppState } from './app.interface';

import { NUMBER_OF_PEOPLE } from './visualization.component';
import { selectControlPanel } from './control-panel.selector';
import { initialVisualizationState } from './visualization.reducer';

import { QuarentineLevels } from './quarentin-level.interface';


declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
	selector: 'stats-dashboard',
	templateUrl: './stats-dashboard.component.html',
	styleUrls: ['./stats-dashboard.component.scss']
})
export class StatsDashboardComponent implements OnInit {

	public quarentineBands: any[] = [];
	private stateSubscription: Subscription;
	public chartRef: Highcharts.Chart;
	public options: any = {
		title: {
			text: 'Tracking the Spread'
		},
		subtitle: {
			text: 'Day 0'
		},
		plotOptions: {
			series: {
				// general options for all series
				marker: {
					enabled: false
				}
			},
			areaspline: {
			}
		},
		xAxis: {
			title: {
				enabled: false
			}
		},
		yAxis: [{
			title: {
				text: 'Amount'
			},
			max: NUMBER_OF_PEOPLE
		}, {
			title: {
				text: 'Quarentine Level'
			},
			opposite: true,
			min: 0,
			max: QuarentineLevels.LOCKDOWN.level,
			allowDecimals: false,
			labels: {
				rotation: -45,
				formatter: function() {

					for (const key in QuarentineLevels) {
						if (QuarentineLevels.hasOwnProperty(key)) {
							if(QuarentineLevels[key].level === this.value) {
								return QuarentineLevels[key].mode;
							}
						}
					}
				}
			}
		}],
		colors: [
			VisualizationColors['GREEN'].rgbaString,
			VisualizationColors['RED'].rgbaString,
			VisualizationColors['BLUE'].rgbaString,
			VisualizationColors['GREY'].rgbaString
		],
		series: [{
			type: 'areaspline',
			name: 'Healthy',
			data: []
		}, {
			type: 'areaspline',
			name: 'Contagious',
			data: []
		}, {
			type: 'areaspline',
			name: 'Immune',
			data: []
		}, {
			id: 'interactions',
			type: 'line',
			dashStyle: 'dash',
			marker: {
				enabled: false
			},
			name: 'Quarentine Level',
			yAxis: 1,
			data: []
		}]
	};

	constructor(private store: Store<AppState>, private visualizationStore: Store<VisualizationState>) {
		
		this.stateSubscription = combineLatest(
			this.store.pipe(select(selectControlPanel)),
			this.store.pipe(select(selectVisualization))
		)
		.subscribe(([controlPanelState, visState]) => {
			this.handleControlPanelState(controlPanelState, visState);
			this.handleVisualizationstate(visState);
		});
	}

	
	ngOnInit() {
		this.drawGraph();
	}

	drawGraph() {
		this.chartRef = Highcharts.chart('container', this.options);
	}

	handleControlPanelState(controlPanelState: ControlPanelState, visState: VisualizationState) {
		
		if(!this.chartRef) { return; } //TODO: Probably a better rxjs way to handle this...
		const level = controlPanelState.quarentine.level ? controlPanelState.quarentine.level : 0;
		this.chartRef.series[3].addPoint([visState.daysPassed, level]);
	}

	handleVisualizationstate(visState: VisualizationState) {
		if(visState.daysPassed === 0) { return; }

		this.updateSubtitle(visState);

		if(visState.recovered) {
			this.stateSubscription.unsubscribe();
		} else {
			this.addDayStats(visState);
		}

	}


	addDayStats(visState: VisualizationState) {
		const day: Day = visState.dayHistory[visState.dayHistory.length - 1];
		const avgNumberOfCollisions = Math.floor(day.collisions / day.numPeople);
		this.chartRef.series[0].addPoint([visState.daysPassed, day.numHealthy]);
		this.chartRef.series[1].addPoint([visState.daysPassed, day.numContagious]);
		this.chartRef.series[2].addPoint([visState.daysPassed, day.numImmune]);
	}

	updateSubtitle(visState: VisualizationState) {
		const populationHealthText = visState.recovered ? '- Population Recovered!' : '';
		this.chartRef.subtitle.update({ text: `Day ${visState.daysPassed} ${populationHealthText}` });
	}
}

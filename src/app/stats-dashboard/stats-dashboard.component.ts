import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Store, select } from '@ngrx/store';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { VisualizationState, VisualizationColors } from '../visualization/visualization.interface';
import { ControlPanelState } from '../control-panel/control-panel.interface';
import { selectDayHistory, selectVisualization } from '../visualization/visualization.selector';
import { Day } from '../visualization/Day';
import { AppState } from '../app.interface';

import { selectControlPanel } from '../control-panel/control-panel.selector';
import { initialVisualizationState } from '../visualization/visualization.reducer';

import { QuarantineLevels } from '../quarantine-level.interface';
import { NUMBER_OF_PEOPLE } from '../app.constants';


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
	public numDead: number;
	private stateSubscription: Subscription;
	public chartRef: Highcharts.Chart;
	private playCounter: number = 0;
	private paused: boolean = false;

	constructor(private store: Store<AppState>) {
		
		this.stateSubscription = combineLatest(
			this.store.pipe(select(selectControlPanel)),
			this.store.pipe(select(selectVisualization))
		)
		.subscribe(([controlPanelState, visualizationState]) => {
			this.handleControlPanelState(controlPanelState, visualizationState);
			this.handleVisualizationstate(visualizationState);
		});

	}

	
	ngOnInit() {
		this.drawGraph();
	}

	drawGraph() {
		let options: Highcharts.Options = {
			title: {
				text: 'Tracking the Spread'
			},
			subtitle: {
				useHTML: true,
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
			xAxis: [{
				title: {
					text: ''
				},
				allowDecimals: false
			}],
			yAxis: [{
				title: {
					text: 'Amount'
				},
				max: NUMBER_OF_PEOPLE
			}, {
				title: {
					text: 'Quarantine Level'
				},
				opposite: true,
				min: 0,
				max: QuarantineLevels.LOCKDOWN.level,
				allowDecimals: false,
				labels: {
					rotation: -45,
					formatter: function() {
		
						for (const key in QuarantineLevels) {
							if (QuarantineLevels.hasOwnProperty(key)) {
								if(QuarantineLevels[key].level === this.value) {
									return QuarantineLevels[key].mode;
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
				dashStyle: 'Dash',
				marker: {
					enabled: false
				},
				name: 'Quarantine Level',
				yAxis: 1,
				data: []
			}]
		};
		this.chartRef = Highcharts.chart('container', options);
	}

	handleControlPanelState(controlPanelState: ControlPanelState, visualizationState: VisualizationState) {
		
		if(!this.chartRef || this.paused) { return; } //TODO: Probably a better rxjs way to handle this...
		const level = controlPanelState.quarantine.level ? controlPanelState.quarantine.level : 0;

		this.chartRef.series[3].addPoint([visualizationState.daysPassed, level]);
	}

	handleVisualizationstate(visualizationState: VisualizationState) {
		
		if(!this.chartRef) { return; }

		if(visualizationState.playCounter !== this.playCounter) {

			this.chartRef.destroy();
			this.drawGraph();
			this.playCounter = visualizationState.playCounter;
			this.paused = false;
		} else {
			if(this.paused) { return; }
			this.updateSubtitle(visualizationState);
			this.addDayStats(visualizationState);
		}


		this.paused = visualizationState.recovered;

	}


	addDayStats(visualizationState: VisualizationState) {
		if(visualizationState.daysPassed === 0) { return; }
		const day: Day = visualizationState.dayHistory[visualizationState.dayHistory.length - 1];
		const avgNumberOfCollisions = Math.floor(day.collisions / day.numPeople);
		this.chartRef.series[0].addPoint([visualizationState.daysPassed, day.numHealthy]);
		this.chartRef.series[1].addPoint([visualizationState.daysPassed, day.numContagious]);
		this.chartRef.series[2].addPoint([visualizationState.daysPassed, day.numImmune]);

		this.numDead = day.numDead;
	}

	updateSubtitle(visualizationState: VisualizationState) {
		if(!this.chartRef) { return; }

		const populationHealthText = visualizationState.recovered ? `Population Recovered!` : '';
		this.chartRef.subtitle.update({ text: `<p style="text-align: center";>Day ${visualizationState.daysPassed} - ${this.numDead || 0} dead<br/>${populationHealthText}</p>` });
	}
}

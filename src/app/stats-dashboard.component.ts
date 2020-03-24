import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Store, select } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { VisualizationState } from './visualization.interface';
import { ControlPanelState } from './control-panel.interface';
import { selectDayHistory, selectVisualization } from './visualization.selector';
import { Day } from './Day';
import { AppState } from './app.interface';

import { RED, GREEN, BLUE, GREY, NUMBER_OF_POINTS } from './visualization.component';
import { selectControlPanel } from './control-panel.selector';
import { initialVisualizationState } from './visualization.reducer';

enum QuarentineMode {
	NONE = '',
	LOW = 'rgba(50, 170, 170, .3)',
	MEDIUM = 'rgba(50, 170, 170, .5)',
	HIGH = 'rgba(50, 170, 170, .6)',
	LOCKDOWN = 'rgba(50, 170, 170, .8)'
}

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
	public chartRef: Highcharts.Chart;
	public options: any = {
		chart: {
			type: 'areaspline'
		},
		title: {
			text: 'Tracking the Spread'
		},
		subtitle: {
			text: 'Day 0'
		},
		xAxis: {
			tickmarkPlacement: 'on',
			title: {
				enabled: false
			},
			plotBands: []
		},
		yAxis: [{
			title: {
				text: 'Amount'
			},
			max: NUMBER_OF_POINTS
		},/* {
			title: {
				text: 'Interactions / person / day'
			},
			opposite: true
		}*/],
		colors: [GREEN, RED, BLUE, GREY],
		plotOptions: {
			areaspline: {
				stacking: 'normal',
				lineColor: '#ffffff',
				marker: {
					enabled: false
				}
			}
		},
		series: [{
			name: 'Healthy',
			data: []
		}, {
			name: 'Contagious',
			data: []
		}, {
			name: 'Immune',
			data: []
		}/*, {
			type: 'spline',
			id: 'interactions',
			dashStyle: 'dash',
			name: 'Interactions / person / day',
			yAxis: 1,
			data: []
		}, */]
	};

	constructor(private store: Store<AppState>, private visualizationStore: Store<VisualizationState>) {

		combineLatest(
			this.store.pipe(select(selectControlPanel)),
			this.store.pipe(select(selectVisualization))
		)
		.subscribe(([controlPanelState, visState]) => {
			const day: Day = visState.dayHistory[visState.dayHistory.length - 1];
			this.handleControlPanelState(controlPanelState, day);
			this.handleVisualizationstate(visState)
		});
	}

	
	ngOnInit() {
		this.drawGraph();
	}

	drawGraph() {
		this.chartRef = Highcharts.chart('container', this.options);
	}

	handleControlPanelState(controlPanelState: ControlPanelState, day: Day) {
		if(this.quarentineBands.length === 0) {
			if(!controlPanelState.quarentineMode) { return; }

			// First time adding a band
			const plotBand = {
				id: day.id.toString(),
				from: day.id,
				to: day.id,
				type: controlPanelState.quarentineMode,
				color: QuarentineMode.NONE
			};
			this.addQuarentineBand(plotBand);
		}

		// current quarentine mode is the same as this one... pop.
		const previousBand = this.quarentineBands[this.quarentineBands.length - 1];
		if(previousBand.type === controlPanelState.quarentineMode) {
			const previousBand = this.quarentineBands.shift();
			this.chartRef.xAxis[0].removePlotBand(previousBand.id);
			previousBand.to = day.id.toString();
			this.addQuarentineBand(previousBand);
		}

		// Otherwise we're adding a new band that's different from the current one...
		this.quarentineBands.shift();
		const plotBand = {
			id: day.id.toString(),
			from: day.id,
			to: day.id,
			type: controlPanelState.quarentineMode,
			color: QuarentineMode.NONE
		};
		this.addQuarentineBand(plotBand);
	}

	handleVisualizationstate(visState: VisualizationState) {
		if(visState.daysPassed === 0) { return; }
		this.addDayStats(visState);
		this.updateSubtitle(visState);
	}

	addQuarentineBand(plotBand) {
		this.quarentineBands.push(plotBand);
		this.chartRef.xAxis[0].addPlotBand(plotBand);
	}

	addDayStats(visState: VisualizationState) {
		const day: Day = visState.dayHistory[visState.dayHistory.length - 1];
		const avgNumberOfCollisions = Math.floor(day.collisions / day.numPeople);
		this.chartRef.series[0].addPoint([visState.daysPassed, day.numHealthy]);
		this.chartRef.series[1].addPoint([visState.daysPassed, day.numContagious]);
		this.chartRef.series[2].addPoint([visState.daysPassed, day.numImmune]);
		// this.chartRef.series[3].addPoint([visState.daysPassed, avgNumberOfCollisions]);
	}

	updateSubtitle(visState: VisualizationState) {
		const day: Day = visState.dayHistory[visState.dayHistory.length - 1];
		this.chartRef.subtitle.update({ text: `Day ${visState.dayHistory.length}` });
	}
}

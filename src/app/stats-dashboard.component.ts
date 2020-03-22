import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { Store, select } from '@ngrx/store';
import { VisualizationState } from './visualization.interface';
import { selectDayHistory, selectVisualization } from './visualization.selector';
import { Day } from './Day';
import { AppState } from './app.interface';

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

	public chartRef: Highcharts.Chart;
	public options: any = {
		chart: {
			type: 'area'
		},
		title: {
			text: 'Tracking the Spread'
		},
		subtitle: {
			text: '1 Mo, 5 Days, 2 Hrs'
		},
		xAxis: {
			tickmarkPlacement: 'on',
			title: {
				enabled: false
			}
		},
		yAxis: {
			title: {
				text: 'Amount'
			},
		},
		plotOptions: {
			area: {
				stacking: 'normal',
				lineColor: '#666666',
				lineWidth: 1,
				marker: {
					lineWidth: 1,
					lineColor: '#666666'
				}
			}
		},
		series: [{
			name: 'Interactions / Person / Day',
			data: []
		}]
	};

	constructor(private store: Store<AppState>, private visualizationStore: Store<VisualizationState>) {
		this.store
		.pipe(
			select(selectVisualization)
		)
		.subscribe((visState: VisualizationState) => {
			if(visState.daysPassed === 0) { return; }
			const day: Day = visState.dayHistory[visState.dayHistory.length - 1];
			const avgNumberOfCollisions = Math.floor(day.collisions / day.numPeople);
			this.chartRef.series[0].addPoint([visState.daysPassed, avgNumberOfCollisions]);
		});
	}

	
	ngOnInit() {
		this.drawGraph();
	}

	drawGraph() {
		this.chartRef = Highcharts.chart('container', this.options);
	}
}

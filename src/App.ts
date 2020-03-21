declare var require: any;
require('./index.css');

import { Visualization } from './Visualization';

class App {
	private visualization: Visualization;

	constructor(visualization: Visualization) {
		this.visualization = visualization;
	}

	public setup(): void {
		// Any setup that is required that only runs once before game loads goes here

		this.visualizationLoop();
	}

	private visualizationLoop(): void {
        // need to bind the current this reference to the callback
		requestAnimationFrame(this.visualizationLoop.bind(this)); 

		this.visualization.render();
	}
}

window.onload = () => {
	let app = new App(new Visualization());

	app.setup();
}
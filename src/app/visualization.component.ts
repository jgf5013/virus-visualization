import { Component, ViewChild, ElementRef } from '@angular/core';
import { Person } from './Person';
import { Day } from './Day';
import { Store } from '@ngrx/store';
import { VisualizationState } from './visualization.interface';
import { CaptureDay } from './visualization.actions';

@Component({
	selector: 'visualization',
	templateUrl: './visualization.component.html',
	styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent {

	@ViewChild('canvas', { static: true })
	canvas: ElementRef<HTMLCanvasElement>;

	private context: CanvasRenderingContext2D;
	private NUMBER_OF_POINTS: number = 1000;
	private MIN_CONTACT_DIST: number = 3;
	private COLLISION_ELASTICITY: number = 0.1;
	private FRAMES_PER_DAY: number = 24;
	private canvasHeight: number;
	private canvasWidth: number;
	private day: Day;
	private dayHistory: Day[] = [];

	constructor(private el:ElementRef, private visualizationStore: Store<VisualizationState>) {

	}

	private people: Person[] = [];

	ngOnInit(): void {
		this.context = this.canvas.nativeElement.getContext('2d');
		this.context.canvas.setAttribute('width', this.el.nativeElement.offsetWidth);
		this.context.canvas.setAttribute('height', this.el.nativeElement.offsetHeight);
		this.canvasWidth = this.context.canvas.width;
		this.canvasHeight = this.context.canvas.height;
		this.context.fillStyle = 'rgba(0,0,255,0.7)';
		this.day = new Day(0, 0, this.NUMBER_OF_POINTS);
		this.initializePeople();
		this.render();
	}

	render(): void {
		if(this.day.frames >= this.FRAMES_PER_DAY) {
			this.captureStats();
			this.day = new Day(0, 0, this.NUMBER_OF_POINTS);
		}
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		
		this.people.forEach(person => {
			this.detectCollisions(person);
			person.updatePosition();
			person.updateVelocity();
			// person.updateAcceleration();
			this.context.fillRect(person.x, person.y, 5, 5);
		});
		window.requestAnimationFrame(() => this.render());
		this.day.frames += 1;
	}

	initializePeople() {
		for (let id = 0; id < this.NUMBER_OF_POINTS; id++) {
			let x = Math.random() * this.context.canvas.width;
			let y = Math.random() * this.context.canvas.height;
			this.people.push(new Person(id, x, y));
		}
	}

	detectCollisions(person: Person) {
		this.people.forEach(potentialNeighbor => {
			this.detectCollisionsWithOthers(potentialNeighbor, person);
		});
		this.detectCollisionWithWall(person);

	}

	detectCollisionsWithOthers(person1: Person, person2: Person) {
		const diffX = Math.abs(person1.x - person2.x);
		const diffY = Math.abs(person1.y - person2.y);
		const contact = (diffX <= this.MIN_CONTACT_DIST && diffY <= this.MIN_CONTACT_DIST);
		if (contact && person1.id !== person2.id) {
			this.day.collisions += 1;
			// Update both simultaneously...
			const avgVx = (person1.motion.vx + person2.motion.vx) / 2;
			const avgVy = (person1.motion.vy + person2.motion.vy) / 2;
			person1.motion.vx = (person1.motion.vx + ((1 - this.COLLISION_ELASTICITY) * avgVx)) / 2;
			person1.motion.vy = (person1.motion.vy + ((1 - this.COLLISION_ELASTICITY) * avgVy)) / 2;

			person2.motion.vx = (person2.motion.vx + ((1 - this.COLLISION_ELASTICITY) * avgVx)) / 2;
			person2.motion.vy = (person2.motion.vy + ((1 - this.COLLISION_ELASTICITY) * avgVy)) / 2;
		}
	}

	detectCollisionWithWall(person: Person) {
		if (person.x <= 0) { person.hitWall('left'); return; }
		if (person.x >= this.canvasWidth) { person.hitWall('right'); return; }
		if (person.y <= 0) { person.hitWall('top'); return; }
		if (person.y >= this.canvasWidth) { person.hitWall('bottom'); return; }
	}

	captureStats() {
		this.visualizationStore.dispatch(CaptureDay({day: this.day}));
	}
}

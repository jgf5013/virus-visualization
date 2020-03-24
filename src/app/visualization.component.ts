import { Component, ViewChild, ElementRef } from '@angular/core';
import { Person, InfectionStatus } from './Person';
import { Day } from './Day';
import { Store } from '@ngrx/store';
import { VisualizationState } from './visualization.interface';
import { CaptureDay } from './visualization.actions';


export const NUMBER_OF_POINTS: number = 100;
export const MIN_CONTACT_DIST: number = 3;
export const COLLISION_ELASTICITY: number = 0.1;
export const FRAMES_PER_DAY: number = 24;
export const DAYS_TO_RECOVER: number = 5;

const STARTING_NUMBER_INFECTED: number = 5;


export const RED: string = 'rgba(200,100,100,1.0)';
export const GREEN: string = 'rgba(100,200,150,0.9)';
export const BLUE: string = 'rgba(0,100,250,0.7)';
export const GREY: string = 'rgba(100,100,100,0.7)';


@Component({
	selector: 'visualization',
	templateUrl: './visualization.component.html',
	styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent {

	@ViewChild('canvas', { static: true })
	canvas: ElementRef<HTMLCanvasElement>;

	private context: CanvasRenderingContext2D;
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
		this.day = new Day(0, 0, 0, NUMBER_OF_POINTS);
		this.initializePeople();
		this.context.fillStyle = GREEN;
		this.render();
	}

	render(): void {
		if(this.day.frames >= FRAMES_PER_DAY) {
			this.passDay();
		}
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		
		this.people.forEach(person => {
			this.detectCollisions(person);
			person.updatePosition();
			person.updateVelocity();
			// person.updateAcceleration();
			this.drawPerson(person);
		});
		window.requestAnimationFrame(() => this.render());
		this.day.frames += 1;
	}

	initializePeople() {
		for (let id = 0; id < NUMBER_OF_POINTS; id++) {
			let x = Math.random() * this.context.canvas.width;
			let y = Math.random() * this.context.canvas.height;
			this.people.push(new Person(id, x, y));
		}
		this.startVirus();
	}

	startVirus() {
		//Need to do it with a while loop because you might hit the same person twice...
		while(this.people.filter((p: Person) => p.infectionStatus === InfectionStatus.CONTAGIOUS).length <= STARTING_NUMBER_INFECTED) {
			this.people[Math.floor(Math.random() * this.people.length)].infectionStatus = InfectionStatus.CONTAGIOUS;
		}
	}

	drawPerson(person: Person) {
		switch (person.infectionStatus) {
			case InfectionStatus.HEALTHY:
				this.context.fillStyle = GREEN;
				break;
			case InfectionStatus.CONTAGIOUS:
				this.context.fillStyle = RED;
				break;
			case InfectionStatus.IMMUNE:
				this.context.fillStyle = BLUE;
				break;
			default:
				this.context.fillStyle = GREEN;
				break;
		}
		this.context.fillRect(person.x, person.y, 5, 5);
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
		const contact = (diffX <= MIN_CONTACT_DIST && diffY <= MIN_CONTACT_DIST);
		if (contact && person1.id !== person2.id) {
			this.collide(person1, person2);
			person1.infect(person2, this.day.id);
		}
	}

	detectCollisionWithWall(person: Person) {
		if (person.x <= 0) { person.hitWall('left'); return; }
		if (person.x >= this.canvasWidth) { person.hitWall('right'); return; }
		if (person.y <= 0) { person.hitWall('top'); return; }
		if (person.y >= this.canvasWidth) { person.hitWall('bottom'); return; }
	}

	passDay() {

		this.captureStats();
		this.recoverPopulation();
		this.day = new Day(this.day.id + 1, 0, 0, NUMBER_OF_POINTS);
	}

	captureStats() {
		const numHealthy = this.people.filter(p => (p.infectionStatus === InfectionStatus.HEALTHY)).length;
		const numContagious = this.people.filter(p => (p.infectionStatus === InfectionStatus.CONTAGIOUS)).length;
		const numImmune = this.people.filter(p => (p.infectionStatus === InfectionStatus.IMMUNE)).length;
		this.day.setStats(numHealthy, numContagious, numImmune);
		this.visualizationStore.dispatch(CaptureDay({day: this.day}));
	}

	recoverPopulation() {
		this.people.forEach(person => person.recover(this.day.id));
	}

	collide(person1: Person, person2: Person) {
		
		this.day.collisions += 1;
		// Update both simultaneously...
		const avgVx = (person1.motion.vx + person2.motion.vx) / 2;
		const avgVy = (person1.motion.vy + person2.motion.vy) / 2;
		person1.motion.vx = (person1.motion.vx + ((1 - COLLISION_ELASTICITY) * avgVx)) / 2;
		person1.motion.vy = (person1.motion.vy + ((1 - COLLISION_ELASTICITY) * avgVy)) / 2;

		person2.motion.vx = (person2.motion.vx + ((1 - COLLISION_ELASTICITY) * avgVx)) / 2;
		person2.motion.vy = (person2.motion.vy + ((1 - COLLISION_ELASTICITY) * avgVy)) / 2;
	}
}

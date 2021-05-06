import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { COLLISION_ELASTICITY, DAILY_FATALITY_RATE, FRAMES_PER_DAY, MIN_CONTACT_DIST, NUMBER_OF_PEOPLE, STARTING_NUMBER_INFECTED } from '../app.constants';
import { AppState } from '../app.interface';
import { ControlPanelState } from '../control-panel/control-panel.interface';
import { selectControlPanel } from '../control-panel/control-panel.selector';
import { Quarantine } from '../quarantine-level.interface';
import { Day } from './Day';
import { InfectionStatus, Person } from './Person';
import { CaptureDay, PopulationRecovered } from './visualization.actions';
import { VisualizationColors, VisualizationState } from './visualization.interface';
import { selectVisualization } from './visualization.selector';




@Component({
	selector: 'visualization',
	templateUrl: './visualization.component.html',
	styleUrls: ['./visualization.component.scss']
})
export class VisualizationComponent implements OnInit, AfterViewInit {

	@ViewChild('canvas', { static: true })
	canvas: ElementRef<HTMLCanvasElement>;

	private context: CanvasRenderingContext2D;
	private canvasY0: number;
	private canvasX0: number;
	private canvasHeight: number;
	private canvasWidth: number;
	private day: Day;
	private quarantine: Quarantine;
	private stateSubscription: Subscription;
	private playCounter: number = 0;
	private people: Person[] = [];


	constructor(private el:ElementRef, private visualizationStore: Store<VisualizationState>, private store: Store<AppState>) {
		
		this.store.pipe(select(selectControlPanel))
		.subscribe((controlPaneState: ControlPanelState) => {
			this.quarantine = controlPaneState.quarantine;
		});

		this.store.pipe(select(selectVisualization))
		.subscribe((visualizationState: VisualizationState) => {
			if(visualizationState.playCounter !== this.playCounter) {
				this.day = new Day(0, 0, 0, NUMBER_OF_PEOPLE);
				this.initializePeople();
				this.context.fillStyle = VisualizationColors.GREEN.rgbaString;
				/* Note: No need to render. The next window.requestAnimationFrame
				 * will get it... */
				this.playCounter = visualizationState.playCounter;
			}
		});

		const element = this.el.nativeElement;



	}

	ngOnInit() {
		this.context = this.canvas.nativeElement.getContext('2d');
	}

	ngAfterViewInit() {
		this.day = new Day(0, 0, 0, NUMBER_OF_PEOPLE);
		// this.setCanvasDimensions();
		this.context.fillStyle = VisualizationColors.GREEN.rgbaString;
		this.render();
		this.initializePeople();
	}

	setCanvasDimensions() {
		this.context.canvas.setAttribute('width', this.el.nativeElement.offsetWidth);
		this.context.canvas.setAttribute('height', this.el.nativeElement.offsetHeight);
		this.context.canvas.setAttribute('offsetTop', this.el.nativeElement.offsetTop);
		this.context.canvas.setAttribute('offsetLeft', this.el.nativeElement.offsetLeft);
		this.canvasY0 = this.context.canvas.offsetTop;
		this.canvasX0 = this.context.canvas.offsetLeft;
		this.canvasWidth = this.context.canvas.width;
		this.canvasHeight = this.context.canvas.height;
	}


	render(): void {
		this.setCanvasDimensions();
		if(this.day.frames >= FRAMES_PER_DAY) {
			this.passDay();
		}
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		
		this.people
		.filter((p: Person) => p.infectionStatus !== InfectionStatus.DEAD)
		.forEach(person => {

			this.detectCollisions(person);
			person.updatePosition();
			person.updateVelocity();
			if(this.quarantine) {
				person.quarantine(this.quarantine, NUMBER_OF_PEOPLE);
			}
			// person.updateAcceleration();
			this.drawPerson(person);
		});
		window.requestAnimationFrame(() => this.render());
		this.day.frames += 1;
	}

	initializePeople() {

		this.people = [];

		const ids = [...Array(NUMBER_OF_PEOPLE).keys()];
		const speedIds = [...Array(NUMBER_OF_PEOPLE).keys()];
		const motionIds = [...Array(NUMBER_OF_PEOPLE).keys()];
		
		while(ids.length) {
			const id = ids.splice(Math.floor(Math.random()* ids.length), 1)[0];
			const motionId = speedIds.splice(Math.floor(Math.random()* speedIds.length), 1)[0];
			const speedId = motionIds.splice(Math.floor(Math.random()* motionIds.length), 1)[0];
			let x = Math.random() * this.context.canvas.width;
			let y = Math.random() * this.context.canvas.height;
			this.people.push(new Person(id, x, y, motionId, speedId));
		}
		this.startVirus();
	}

	startVirus() {
		//Need to do it with a while loop because you might hit the same person twice...
		while(this.people.filter((p: Person) => p.infectionStatus === InfectionStatus.CONTAGIOUS).length <= STARTING_NUMBER_INFECTED) {
			const person: Person = this.people[Math.floor(Math.random() * this.people.length)];
			person.infectionStatus = InfectionStatus.CONTAGIOUS;
			person.infectionDay = 0;
		}
	}

	drawPerson(person: Person) {
		switch (person.infectionStatus) {
			case InfectionStatus.HEALTHY:
				this.context.fillStyle = VisualizationColors.GREEN.rgbaString;
				break;
			case InfectionStatus.CONTAGIOUS:
				this.context.fillStyle = VisualizationColors.RED.rgbaString;
				break;
			case InfectionStatus.IMMUNE:
				this.context.fillStyle = VisualizationColors.BLUE.rgbaString;
				break;
			default:
				this.context.fillStyle = VisualizationColors.GREEN.rgbaString;
				break;
		}
		this.context.fillRect(person.x, person.y, 3, 3);
	}

	detectCollisions(person: Person) {
		this.people
		.filter((p: Person) => p.infectionStatus !== InfectionStatus.DEAD)
		.forEach(potentialNeighbor => {
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
		if (person.y >= this.canvasHeight) { person.hitWall('bottom'); return; }
	}

	passDay() {
		this.dieOff();
		this.checkPopulationHealth();
		this.captureStats();
		this.recoverPopulation();
		this.day = new Day(this.day.id + 1, 0, 0, NUMBER_OF_PEOPLE);
	}

	checkPopulationHealth() {
		if(this.people.filter(p => p.infectionStatus === InfectionStatus.CONTAGIOUS).length === 0) {
			this.visualizationStore.dispatch(PopulationRecovered());
		}
	}

	captureStats() {
		const numHealthy = this.people.filter(p => (p.infectionStatus === InfectionStatus.HEALTHY)).length;
		const numContagious = this.people.filter(p => (p.infectionStatus === InfectionStatus.CONTAGIOUS)).length;
		const numImmune = this.people.filter(p => (p.infectionStatus === InfectionStatus.IMMUNE)).length;
		const numDead = this.people.filter(p => p.infectionStatus === InfectionStatus.DEAD).length;
		this.day.setStats(numHealthy, numContagious, numImmune, numDead);
		this.visualizationStore.dispatch(CaptureDay({day: this.day}));
	}

	dieOff() {
		this.people
		.filter((p: Person) => p.infectionStatus === InfectionStatus.CONTAGIOUS)
		.forEach((p: Person) => {
			if(p.id < NUMBER_OF_PEOPLE * Math.random() * DAILY_FATALITY_RATE) {
				p.die();
			}
		});
	}

	recoverPopulation() {
		this.people
		.filter((p: Person) => p.infectionStatus === InfectionStatus.CONTAGIOUS)
		.forEach(person => person.recover(this.day.id));
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

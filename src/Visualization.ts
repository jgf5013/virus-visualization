import { Person } from "./Person";

export class Visualization {
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private height: number = window.innerHeight;
	private width: number = window.innerWidth;
	private NUMBER_OF_POINTS: number = 100;
	private MIN_CONTACT_DIST: number = 5;
	private COLLISION_ELASTICITY: number = 0.1;

	private people: Person[] = [];

	constructor() {
		this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext("2d");
		this.context.fillStyle = 'rgba(0,0,255,0.7)';
		this.initializePeople();
	}

	initializePeople() {
		for (let id = 0; id < this.NUMBER_OF_POINTS; id++) {
			let x = Math.random() * this.width;
			let y = Math.random() * this.height;
			this.people.push(new Person(id, x, y));
		}
	}


	public render(): void {

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.people.forEach(person => {
			this.detectCollisions(person);
			person.updatePosition();
			person.updateVelocity();
			// person.updateAcceleration();
			this.context.fillRect(person.x, person.y, 5, 5);
		});
		// console.log('rendering...');
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
		if(contact && person1.id !== person2.id) {
			// Update both simultaneously... completely inelastic collision
			const avgVx = (person1.motion.vx + person2.motion.vx) / 2;
			const avgVy = (person1.motion.vy + person2.motion.vy) / 2;
			person1.motion.vx = (person1.motion.vx + ((1 - this.COLLISION_ELASTICITY) * avgVx)) / 2;
			person1.motion.vy = (person1.motion.vy + ((1 - this.COLLISION_ELASTICITY) * avgVy)) / 2;
			
			person2.motion.vx = (person2.motion.vx + ((1 - this.COLLISION_ELASTICITY) * avgVx)) / 2;
			person2.motion.vy = (person2.motion.vy + ((1 - this.COLLISION_ELASTICITY) * avgVy)) / 2;
		}
	}

	detectCollisionWithWall(person: Person) {
		if(person.x <= 0) { person.hitWall('left'); }
		if(person.x >= this.width) { person.hitWall('right'); }
		if(person.y <= 0) { person.hitWall('top'); }
		if(person.y >= this.height) { person.hitWall('bottom'); }
	}
}
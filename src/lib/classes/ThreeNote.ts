import { GLOBALS } from '$lib/globals';
import * as THREE from 'three';
import { v4 as uuid } from 'uuid';

export interface PartialNote {
	offset: number;
	lane: number;
	length: number;
	swipe?: number;
}

export class ThreeNote {
	note?: THREE.Mesh;
	bar?: THREE.Group | THREE.Mesh;
	id: string;
	lane: number;
	offset: number;
	swipe?: number;
	moonscraperOffset: number;
	length: number;
	visualLength: number = 30;

	constructor(offset: number, lane: number, length: number, swipe?: number) {
		this.id = uuid();
		this.offset = offset;
		this.moonscraperOffset = offset * 192;
		this.lane = lane;
		this.length = length * 192;
		this.swipe = swipe;
	}
	init(prevNote: ThreeNote, nextNote: ThreeNote) {
		this.visualLength = this.calculateVisualLength(this.length, prevNote, nextNote);
		this.note = this.createNote();
		this.bar = this.swipe ? this.createArrow() : this.createBar();

		this.note.userData = { type: 'note', id: this.id };
	}
	calculateVisualLength(length: number, previousNote: ThreeNote, nextNote: ThreeNote) {
		const padding = 10;
		let adjustedHeight = this.visualLength;

		if (nextNote && this.lane === nextNote.lane) {
			const thisY =
				adjustedHeight * this.offset - adjustedHeight + GLOBALS.page * GLOBALS.scrollFactor;
			const nextY =
				adjustedHeight * nextNote.offset -
				nextNote.visualLength +
				GLOBALS.page * GLOBALS.scrollFactor;

			if (Math.abs(Math.abs(thisY) - Math.abs(nextY)) < adjustedHeight) {
				if (this.visualLength === nextNote.visualLength) {
					adjustedHeight -= Math.abs(Math.abs(thisY) - Math.abs(nextY));
					nextNote.visualLength -= Math.abs(Math.abs(thisY) - Math.abs(nextY));
				} else {
					const smaller =
						this.visualLength < nextNote.visualLength ? this.visualLength : nextNote.visualLength;
					adjustedHeight = smaller;
					nextNote.visualLength = smaller;
				}
			}
		}

		if (length) {
			const steps = this.length / 192;
			adjustedHeight += padding * steps + adjustedHeight * steps;
			adjustedHeight -= adjustedHeight / 2;
		}

		return adjustedHeight;
	}
	createNote() {
		const padding = 10;
		const laneWidth = GLOBALS.screenWidth / 3;
		const width = laneWidth - padding;
		const height = 30;
		const radius = 3; // Corner radius

		const shape = new THREE.Shape();
		shape.moveTo(-width / 2 + radius, -height / 2);
		shape.lineTo(width / 2 - radius, -height / 2);
		shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);

		shape.lineTo(width / 2, this.visualLength - height / 2 - radius);
		shape.quadraticCurveTo(
			width / 2,
			this.visualLength - height / 2,
			width / 2 - radius,
			this.visualLength - height / 2
		);

		shape.lineTo(-width / 2 + radius, this.visualLength - height / 2);
		shape.quadraticCurveTo(
			-width / 2,
			this.visualLength - height / 2,
			-width / 2,
			this.visualLength - height / 2 - radius
		);

		shape.lineTo(-width / 2, -height / 2 + radius);
		shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

		const geometry = new THREE.ShapeGeometry(shape);
		const material = new THREE.MeshBasicMaterial({ color: 'black' });
		const note = new THREE.Mesh(geometry, material);

		const xPosition = -GLOBALS.screenWidth / 2 + laneWidth * (this.lane + 0.5);
		note.position.x = xPosition;
		note.position.z = 0.1;

		return note;
	}
	createBar() {
		const laneWidth = GLOBALS.screenWidth / GLOBALS.numberOfLanes;
		const xPosition = -GLOBALS.screenWidth / 2 + laneWidth * (this.lane + 0.5);
		const padding = 10;
		const height = GLOBALS.noteHeight;
		const width = laneWidth - padding;
		const lineLength = this.visualLength - height / 2;

		const group = new THREE.Group();

		const barMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
		const barGeometry = new THREE.PlaneGeometry(width - padding, 2);
		const bar = new THREE.Mesh(barGeometry, barMaterial);
		bar.position.z = 0.2;

		group.add(bar);

		if (this.length) {
			const verticalGeometry = new THREE.PlaneGeometry(width / 4 - padding, lineLength);
			const verticalMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
			const verticalPlane = new THREE.Mesh(verticalGeometry, verticalMaterial);
			verticalPlane.position.set(0, lineLength / 2, 0.2);

			group.add(verticalPlane);
		}

		group.position.set(xPosition, this.visualLength * this.offset - this.visualLength, 0.2);

		return group;
	}
	createArrow() {
		const laneWidth = GLOBALS.screenWidth / GLOBALS.numberOfLanes;
		const xPosition = -GLOBALS.screenWidth / 2 + laneWidth * (this.lane + 0.5);
		const arrows = {
			up: [
				[30, 7],
				[17.5, -2],
				[5, 7],
				[7, 10],
				[15, 4],
				[15, 31],
				[20, 31],
				[20, 4],
				[28, 10]
			],
			left: [
				[-7, 30],
				[2, 17.5],
				[-7, 5],
				[-10, 7],
				[-4, 15],
				[-31, 15],
				[-31, 20],
				[-4, 20],
				[-10, 28]
			],
			down: [
				[-30, -7],
				[-17.5, 2],
				[-5, -7],
				[-7, -10],
				[-15, -4],
				[-15, -31],
				[-20, -31],
				[-20, -4],
				[-28, -10]
			],
			right: [
				[-30, -7],
				[-17.5, 2],
				[-5, -7],
				[-7, -10],
				[-15, -4],
				[-15, -31],
				[-20, -31],
				[-20, -4],
				[-28, -10]
			]
		};
		const path = new THREE.Path();

		const directions = ['up', 'down', 'left', 'right'];

		const arrow = arrows[directions[this.swipe - 1]];

		path.moveTo(arrow[0][0], arrow[0][1]);

		for (let i = 1; i < arrow.length; i++) {
			path.lineTo(arrow[i][0], arrow[i][1]);
		}
		path.closePath();

		const shape = new THREE.Shape(path.getPoints());

		const shapeGeometry = new THREE.ShapeGeometry(shape);
		shapeGeometry.center();

		const fillMaterial = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide });
		const shapeMesh = new THREE.Mesh(shapeGeometry, fillMaterial);

		shapeMesh.position.x = xPosition;
		shapeMesh.scale.set(1.5, 0.75, 1);

		shapeMesh.rotation.z = Math.PI / 1;

		return shapeMesh;
	}
	draw(scene: THREE.Scene) {
		const height = GLOBALS.noteHeight;
		this.note.position.y = height * this.offset - height + GLOBALS.page * GLOBALS.scrollFactor;
		this.bar.position.y =
			height * this.offset -
			height -
			(this.length ? 0 : (height - this.visualLength - 10) / 2) +
			GLOBALS.page * GLOBALS.scrollFactor;
		this.note.position.z = 0.1;
		this.bar.position.z = 0.2;
		scene.add(this.note);
		scene.add(this.bar);
	}
}

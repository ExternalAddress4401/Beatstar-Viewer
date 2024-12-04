import { GLOBALS } from '$lib/globals';
import * as THREE from 'three';
import { v4 as uuid } from 'uuid';
import type { Viewer } from './Viewer.svelte';
import { createRect } from '$lib/tools/RectHelper';
import { ThreeGroup } from './ThreeGroup';

export interface PartialNote {
	offset: number;
	lane: number;
	length: number;
	swipe?: number;
}

export class ThreeNote {
	viewer: Viewer;
	note: ThreeGroup = new ThreeGroup();
	id: string;
	lane: number;
	offset: number;
	swipe?: number;
	moonscraperOffset: number;
	length: number;
	visualLength: number = 30;
	isSection: boolean = false;

	constructor(viewer: Viewer, offset: number, lane: number, length: number, swipe?: number) {
		this.id = uuid();
		this.viewer = viewer;
		this.offset = offset;
		this.moonscraperOffset = offset * 192;
		this.lane = lane;
		this.length = length * 192;
		this.swipe = swipe;
	}
	init(prevNote: ThreeNote, nextNote: ThreeNote, sections: number[]) {
		this.visualLength = this.calculateVisualLength(this.length, prevNote, nextNote);
		this.createNote();
		this.isSection = sections.includes(this.offset);

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
			adjustedHeight += padding * steps + adjustedHeight * steps - adjustedHeight / 2;
		}

		return adjustedHeight;
	}
	update() {
		if (this.note) {
			this.viewer.scene.remove(this.note);
			this.note.clear();
		}
		// Create new meshes
		this.createNote();
		if (this.swipe) {
			this.createArrow();
		} else {
			this.createBar();
		}
	}
	createNote() {
		const padding = 3;
		const width = this.viewer.planeSize / 3 - padding;
		const height = GLOBALS.noteLength;
		const radius = 3;

		if (this.isSection) {
			const note = createRect(this.visualLength, width - 2, height - 2, radius);
			const bottom = createRect(this.visualLength + 4, width + 2, height + 2, radius + 2, {
				color: 'red'
			});
			note.userData = { type: 'note', id: this.id };
			this.note.push(bottom);
			this.note.push(note);
		} else {
			const note = createRect(this.visualLength, width, this.visualLength, radius);
			note.userData = { type: 'note', id: this.id };
			this.note.push(note);
		}

		this.note.position.x = ((this.lane - 1) * this.viewer.planeSize) / 3;
	}
	createBar() {
		const padding = 3;
		const width = this.viewer.planeSize / 3 - padding;
		const lineLength = this.visualLength - GLOBALS.noteLength / 2 - padding;

		if (this.isSection) {
			const radius = this.viewer.planeSize / 10;
			const segments = 32;
			const geometry = new THREE.CircleGeometry(radius, segments);
			const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
			const circle = new THREE.Mesh(geometry, material);
			this.note.push(circle);
		}
		if (this.length) {
			const verticalGeometry = new THREE.PlaneGeometry(width / 4 - padding, lineLength);
			const verticalMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
			const verticalPlane = new THREE.Mesh(verticalGeometry, verticalMaterial);
			verticalPlane.position.set(0, 5, 0.2); //why is this 8???
			if (this.moonscraperOffset === 480) {
				console.log(this.visualLength, GLOBALS.noteLength, lineLength, padding);
			}
			verticalPlane.userData = { type: 'bar' };

			this.note.push(verticalPlane);
		}
		if (!this.isSection) {
			const barMaterial = new THREE.MeshBasicMaterial({ color: 'red' });
			const barGeometry = new THREE.PlaneGeometry(width - padding, 2);
			const bar = new THREE.Mesh(barGeometry, barMaterial);
			if (this.length) {
				bar.position.y = -this.visualLength / 2 + GLOBALS.noteLength / 2;
			}

			this.note.push(bar);
		}
	}
	createArrow() {
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

		shapeMesh.scale.set(0.5, 0.5, 1);

		shapeMesh.rotation.z = Math.PI / 1;

		this.note.push(shapeMesh);
	}
	draw(viewer: Viewer) {
		this.note.position.y =
			this.visualLength / 2 + this.offset * 40 + this.offset + viewer.page * GLOBALS.scrollFactor;

		viewer.scene.add(this.note);
	}
}

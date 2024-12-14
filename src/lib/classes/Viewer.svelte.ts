import * as THREE from 'three';
import { ThreeNote, type PartialNote } from './ThreeNote';
import { Mouse } from './Mouse';

export class Viewer {
	container: HTMLElement;
	width: number;
	height: number;
	planeSize: number = 100;
	scene: THREE.Scene;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.Renderer;
	playing: boolean = false;
	page: number = 0;
	notes: ThreeNote[] = [];
	sections: number[];
	raycaster: THREE.Raycaster;
	mouse: Mouse;
	selectedNote = $state<ThreeNote>();
	debug: boolean = true;

	constructor(container: HTMLElement | null, notes: PartialNote[], sections: number[]) {
		if (!container) {
			throw new Error('No container found!');
		}
		this.container = container;
		this.width = container.clientWidth;
		this.height = container.clientHeight;
		this.sections = sections;
		this.notes = this.buildNotes(notes);

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.raycaster = new THREE.Raycaster();
		this.mouse = new Mouse();

		this.init();
	}
	init() {
		document.getElementById('viewer')?.appendChild(this.renderer.domElement);
		this.renderer.setSize(this.width, this.height);
		this.scene.background = new THREE.Color('black');

		this.camera.position.set(0, -20, 100); // set y to 20 for tile
		this.camera.lookAt(0, 0, 0);

		this.attachDOMEvents();
		this.drawBackground();
		this.drawLines();
		this.animate();
		this.onWindowResize();
	}
	buildNotes(notes: PartialNote[]) {
		const built: ThreeNote[] = [];
		for (const note of notes) {
			built.push(new ThreeNote(this, note.offset, note.lane, note.length, note.swipe));
		}

		if (this.debug) {
			built.push(new ThreeNote(this, 0.5, 2, 0));
			built.push(new ThreeNote(this, 1, 1, 0));
			built.push(new ThreeNote(this, 1.5, 2, 0));
			built.push(new ThreeNote(this, 2.5, 0, 3));
		}

		for (let i = 0; i < built.length; i++) {
			const note = built[i];
			note.init(built[i - 1], built[i + 1], this.sections);
		}

		return built;
	}
	attachDOMEvents() {
		document.addEventListener('keydown', (event) => {
			if (event.code === 'Space') {
				this.playing = !this.playing;
			}
		});

		document.addEventListener('mousemove', (event) => {
			event.preventDefault();

			this.mouse.updateCoordinates(this.renderer, event);

			this.raycaster.setFromCamera(this.mouse.coordinates, this.camera);
			document.body.style.cursor = 'auto';

			for (const note of this.notes) {
				const child = note.note.children.find((el) => el.userData.type === 'note');
				child.material.color.setHex(0x000000);
			}

			const intersects = this.raycaster.intersectObject(this.scene, true);
			for (const intersect of intersects) {
				if (intersect.object.userData.type === 'note') {
					document.body.style.cursor = 'pointer';
					intersect.object.material.color.setHex(0x00ff00);
				}
			}
		});

		document.addEventListener('click', (event) => {
			event.preventDefault();

			this.mouse.updateCoordinates(this.renderer, event);

			this.raycaster.setFromCamera(this.mouse.coordinates, this.camera);

			const intersects = this.raycaster.intersectObject(this.scene, true);
			for (const c of intersects) {
				console.log(c.object.userData);
				if (c.object.userData.type === 'note') {
					console.log('set selected note');
					this.selectedNote = this.notes.find((note) => note.id === c.object.userData.id);
				}
			}
		});

		document.addEventListener('wheel', (event) => {
			const delta = event.deltaY;
			if (delta < 0) {
				this.page--;
			} else {
				if (this.page === 0) {
					return;
				}
				this.page++;
			}
		});

		window.addEventListener('resize', this.onWindowResize, false);
	}
	onWindowResize = () => {
		this.width = this.container.clientWidth;
		this.height = this.container.clientHeight;

		// Update camera
		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();

		// Update renderer
		this.renderer.setSize(this.width, this.height);

		// Clear existing background and lines
		this.scene.children = this.scene.children.filter(
			(child) =>
				!(child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) &&
				!(child instanceof THREE.Line)
		);

		// Redraw background and lines
		this.drawBackground();
		this.drawLines();
		this.notes.forEach((note) => note.update());
	};
	animate = () => {
		requestAnimationFrame(this.animate);

		if (this.playing) {
			this.page -= 0.1;
		}
		for (const note of this.notes) {
			note.draw(this);
		}

		this.renderer.render(this.scene, this.camera);
	};
	drawBackground() {
		const aspectRatio = this.width / this.height;
		const planeHeight = 100; // Fixed height in world units
		const planeWidth = planeHeight * aspectRatio;
		this.planeSize = planeWidth; // Store for use in other methods

		const rectangleGeometry = new THREE.PlaneGeometry(this.planeSize, this.height);
		const rectangleMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
		const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
		this.scene.add(rectangle);
	}
	drawLines() {
		const sections = 3;
		const laneWidth = this.planeSize / sections;

		const lineMaterial = new THREE.LineBasicMaterial({ color: 'gray' });
		for (let i = 1; i < sections; i++) {
			const lineGeometry = new THREE.BufferGeometry();
			const x = i * laneWidth - this.planeSize / 2;
			const lineVertices = [x, -this.height / 2, 0.1, x, this.height / 2, 0.1];
			lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
			const line = new THREE.Line(lineGeometry, lineMaterial);
			this.scene.add(line);
		}
	}
}

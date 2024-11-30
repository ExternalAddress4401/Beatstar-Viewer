<script lang="ts">
	import { browser } from '$app/environment';
	import { ThreeNote } from '$lib/classes/ThreeNote';
	import { GLOBALS } from '$lib/globals';
	import * as THREE from 'three';

	let { data } = $props();
	let selectedNote: ThreeNote | undefined = $state();

	if (browser) {
		GLOBALS.windowWidth = window.innerWidth;
		let camera: THREE.PerspectiveCamera;
		let scene: THREE.Scene;
		let renderer: THREE.WebGLRenderer;
		let raycaster: THREE.Raycaster = new THREE.Raycaster();
		let mouse = new THREE.Vector2();

		let notes: ThreeNote[] = [];

		const init = () => {
			scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera(75, GLOBALS.windowWidth / window.innerHeight, 0.1, 1000);

			renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setSize(720, window.innerHeight);
			document.getElementById('viewer')?.appendChild(renderer.domElement);

			document.addEventListener('keydown', (event) => {
				if (event.code === 'Space') {
					GLOBALS.playing = !GLOBALS.playing;
				}
			});

			document.addEventListener('mousemove', (event) => {
				event.preventDefault();

				const rect = renderer.domElement.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;

				mouse.x = (x / rect.width) * 2 - 1;
				mouse.y = -(y / rect.height) * 2 + 1;

				raycaster.setFromCamera(mouse, camera);
				document.body.style.cursor = 'auto';

				for (const note of notes) {
					note.note.material.color.setHex(0x000000);
				}

				const intersects = raycaster.intersectObject(scene, true);
				for (const c of intersects) {
					if (c.object.userData.type === 'note') {
						document.body.style.cursor = 'pointer';
						c.object.material.color.setHex(0x00ff00);
					}
				}
			});

			document.addEventListener('click', (event) => {
				event.preventDefault();

				const rect = renderer.domElement.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;

				mouse.x = (x / rect.width) * 2 - 1;
				mouse.y = -(y / rect.height) * 2 + 1;

				raycaster.setFromCamera(mouse, camera);

				const intersects = raycaster.intersectObject(scene, true);
				for (const c of intersects) {
					if (c.object.userData.type === 'note') {
						selectedNote = notes.find((note) => note.id === c.object.userData.id);
					}
				}
			});

			document.addEventListener('wheel', (event) => {
				const delta = event.deltaY;
				if (delta < 0) {
					GLOBALS.page--;
				} else {
					if (GLOBALS.page === 0) {
						return;
					}
					GLOBALS.page++;
				}
			});

			scene.background = new THREE.Color('black');

			drawRectangleWithSections();

			notes.push(new ThreeNote(0, 1, 0));
			notes.push(new ThreeNote(0.5, 1, 0));
			notes.push(new ThreeNote(1, 1, 0));

			for (const note of data.notes) {
				notes.push(new ThreeNote(note.offset, note.lane, note.length, note.swipe));
			}
			for (let i = 0; i < notes.length; i++) {
				const note = notes[i];
				note.init(notes[i - 1], notes[i + 1]);
			}

			camera.position.set(0, -20, 100);
			camera.lookAt(0, 0, 0);

			window.addEventListener('resize', onWindowResize, false);
		};

		const onWindowResize = () => {
			camera.aspect = GLOBALS.windowWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			//renderer.setSize(GLOBALS.windowWidth, window.innerHeight);
		};

		const render = () => {
			renderer.render(scene, camera);
		};

		const animate = () => {
			requestAnimationFrame(animate);

			if (GLOBALS.playing) {
				GLOBALS.page -= 0.1;
			}
			for (const note of notes) {
				note.draw(scene);
			}

			render();
		};

		const drawRectangleWithSections = () => {
			const width = 200;
			const height = 150;
			const sections = 3;

			const rectangleGeometry = new THREE.PlaneGeometry(width, height);
			const rectangleMaterial = new THREE.MeshBasicMaterial({ color: 'white' });
			const rectangle = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
			scene.add(rectangle);

			const lineMaterial = new THREE.LineBasicMaterial({ color: 'gray' });
			for (let i = 1; i < sections; i++) {
				const lineGeometry = new THREE.BufferGeometry();
				const x = -width / 2 + (i / sections) * width;
				const lineVertices = [
					x,
					-height / 2,
					0.1, // Slight offset in z to ensure lines are visible above the rectangle
					x,
					height / 2,
					0.1
				];
				lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
				const line = new THREE.Line(lineGeometry, lineMaterial);
				scene.add(line);
			}
		};

		init();
		animate();
	}
</script>

<div class="container">
	<div id="viewer" class="col"></div>
	<div class="col info">
		<p>Moonscraper: {selectedNote?.moonscraperOffset}</p>
		<p>Length: {selectedNote?.length}</p>
		<p>Swipe: {selectedNote?.swipe}</p>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
	}
	.col {
		flex: 1;
	}
	.info {
		padding-top: 4rem;
	}
</style>

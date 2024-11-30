<script lang="ts">
	import { Canvas } from '$lib/classes/Canvas';
	import { Note } from '$lib/classes/Note';
	import type p5 from 'p5';
	import type { Camera } from 'p5';
	import { onMount } from 'svelte';

	let canvas: Canvas;
	let camera: Camera;

	let { data } = $props();
	let op;

	onMount(async () => {
		// Dynamically import p5 only on the client side
		const p5 = (await import('p5')).default;

		const tick = (p: p5) => {
			op = p;
			let canvasInstance;

			p.setup = () => {
				const notes = data.notes.map((note) => new Note(p, note.offset, note.lane, note.length));
				canvasInstance = p.createCanvas(800, 600, p.WEBGL);
				canvasInstance.parent('p5-container');
				canvas = new Canvas(notes);
				camera = p.createCamera();
				camera.setPosition(0, 300, 900);
				camera.lookAt(0, 0, 0);
			};

			p.draw = () => {
				p.noLoop();
				canvas.tick(p);
			};
		};

		new p5(tick);
	});

	const scroll = (e) => {
		const delta = e.deltaY;
		if (delta > 0) {
			canvas.page++;
		} else {
			canvas.page--;
		}
		op.loop();
	};

	const mousemove = (e) => {
		const screenPos = console.log(e);
	};
</script>

<div id="p5-container" onwheel={scroll} onmousemove={mousemove}></div>

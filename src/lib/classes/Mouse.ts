import * as THREE from 'three';

export class Mouse {
	#coordinates: THREE.Vector2;

	constructor() {
		this.#coordinates = new THREE.Vector2(0, 0);
	}

	updateCoordinates(renderer: THREE.Renderer, event: any) {
		const rect = renderer.domElement.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		this.#coordinates.x = (x / rect.width) * 2 - 1;
		this.#coordinates.y = -(y / rect.height) * 2 + 1;
	}
	get x() {
		return this.#coordinates.x;
	}
	get y() {
		return this.#coordinates.y;
	}
	get coordinates() {
		return this.#coordinates;
	}
}

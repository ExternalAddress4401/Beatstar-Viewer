import * as THREE from 'three';

export class ThreeGroup extends THREE.Group {
	z: number = 0;

	constructor() {
		super();
	}
	push(mesh: THREE.Mesh) {
		this.z += 0.1;
		mesh.position.z = this.z;
		this.add(mesh);
	}
}

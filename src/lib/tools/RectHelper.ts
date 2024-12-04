import * as THREE from 'three';

interface RectOptions {
	color?: string;
}

export const createRect = (
	visualLength: number,
	width: number,
	height: number,
	radius: number,
	options?: RectOptions
) => {
	const shape = new THREE.Shape();
	shape.moveTo(-width / 2 + radius, -height / 2);
	shape.lineTo(width / 2 - radius, -height / 2);
	shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + radius);

	shape.lineTo(width / 2, visualLength - height / 2 - radius);
	shape.quadraticCurveTo(
		width / 2,
		visualLength - height / 2,
		width / 2 - radius,
		visualLength - height / 2
	);

	shape.lineTo(-width / 2 + radius, visualLength - height / 2);
	shape.quadraticCurveTo(
		-width / 2,
		visualLength - height / 2,
		-width / 2,
		visualLength - height / 2 - radius
	);

	shape.lineTo(-width / 2, -height / 2 + radius);
	shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + radius, -height / 2);

	const geometry = new THREE.ShapeGeometry(shape);
	const material = new THREE.MeshBasicMaterial({ color: options?.color ?? 'black' });
	const note = new THREE.Mesh(geometry, material);

	return note;
};

import type p5 from 'p5';
import { Note } from './Note';

export class Canvas {
	notes: Note[];
	defaultNoteHeight: number = 150;
	page: number = 0;

	constructor(notes: Note[]) {
		this.notes = notes;
	}
	setNotes(notes: Note[]) {
		this.notes = notes;
	}
	tick(p: p5) {
		const rectWidth = p.width;
		const rectHeight = p.height + 70;
		const laneWidth = rectWidth / 3;

		p.translate(0, 0, 1);
		// Draw the background rectangle
		p.fill('white');
		p.rect(-rectWidth / 2, -rectHeight / 2 - 100, rectWidth, rectHeight + 100);

		// Draw the dividing lines
		p.strokeWeight(3);
		p.stroke('gray');
		p.line(
			-rectWidth / 2 + rectWidth / 3,
			rectHeight / 2,
			-rectWidth / 2 + rectWidth / 3,
			-rectHeight / 2 - 100
		);
		p.line(
			rectWidth / 2 - rectWidth / 3,
			rectHeight / 2,
			rectWidth / 2 - rectWidth / 3,
			-rectHeight / 2 - 100
		);

		for (const note of this.notes) {
			note.tick(p, laneWidth, this.defaultNoteHeight, this.page);
		}
	}
}

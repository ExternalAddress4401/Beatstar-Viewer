import type p5 from 'p5';

export class Note {
	p: p5;
	offset: number;
	lane: number;
	length: number;
	swipe: number;

	constructor(p: p5, offset: number, lane: number, length: number) {
		this.p = p;
		this.offset = offset;
		this.lane = lane;
		this.length = length;
	}
	tick(p: p5, laneWidth: number, defaultNoteHeight: number, page: number) {
		const width = 150;
		const height = defaultNoteHeight + this.length;
		const padding = width / 2;
		const linePadding = 20;
		const lineHeight = 10;
		const tailWidth = 5;

		const x = this.lane === 0 ? -laneWidth : this.lane === 1 ? 0 : laneWidth;

		p.fill('white');
		p.noStroke();

		p.push();

		p.translate(0, 0, 1);
		p.fill('black');
		p.rect(x - padding, (-this.offset - page) * defaultNoteHeight - this.length, width, height, 5);

		p.translate(0, 0, 1);

		//light
		p.fill('blue');
		p.rect(
			x - width / 2 + linePadding,
			height / 2 - lineHeight / 2 - (this.offset + page) * defaultNoteHeight - this.length / 2,
			width - linePadding * 2,
			lineHeight
		);

		p.pop();

		//tail
		if (this.length) {
			//draw straight tail
			p.fill('blue');
			p.rect(
				-tailWidth,
				-height / 4 - (this.offset + page) * defaultNoteHeight,
				tailWidth * 2,
				height - (height / 2 - lineHeight / 2 - this.offset * defaultNoteHeight - this.length / 2)
			);
		}
	}
}

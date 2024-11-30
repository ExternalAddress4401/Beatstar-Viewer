import type { PartialNote } from '$lib/classes/ThreeNote';
import type { PageServerLoad } from './$types';
import fs from 'fs';

export const load: PageServerLoad = async () => {
	const chart = JSON.parse(fs.readFileSync('./chart.chart').toString());
	const notes: PartialNote[] = [];
	for (const note of chart.notes) {
		if (note.single) {
			notes.push({
				offset: note.single.note.offset,
				lane: note.single.note.lane - 1,
				length: 0
			});
		} else if (note.long) {
			notes.push({
				offset: note.long.note[0].offset,
				lane: note.long.note.lane - 1,
				length: note.long.lote[1].offset - note.long.note[0].offset
			});
		} else {
			console.log(note);
		}
	}
	return { notes };
};

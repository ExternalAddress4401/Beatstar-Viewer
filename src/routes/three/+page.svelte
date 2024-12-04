<script lang="ts">
	import { browser } from '$app/environment';
	import { Viewer } from '$lib/classes/Viewer.svelte.js';

	let { data } = $props();
	let viewer: Viewer | null = null;

	if (browser) {
		viewer = new Viewer(document.getElementById('viewer'), data.notes, data.sections);
	}
</script>

<div class="container">
	<div id="viewer" class="col"></div>
	<div class="col info">
		<p>Moonscraper: {viewer?.selectedNote?.moonscraperOffset}</p>
		<p>Length: {viewer?.selectedNote?.length}</p>
		<p>Swipe: {viewer?.selectedNote?.swipe}</p>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: row;
	}
	.col {
		flex: 1;
		height: 100vh;
	}
	.info {
		padding-top: 4rem;
	}
</style>

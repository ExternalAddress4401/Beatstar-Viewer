<script lang="ts">
	import Bell from '$lib/icons/bell.svelte';
	import File from '$lib/icons/file.svelte';
	import Font from '$lib/icons/font.svelte';
	import Joystick from '$lib/icons/joystick.svelte';
	import Language from '$lib/icons/language.svelte';
	import Music from '$lib/icons/music.svelte';
	import Scale from '$lib/icons/scale.svelte';
	import Song from '$lib/icons/song.svelte';
	import '$lib/breakpoints.scss';

	let { title, version } = $props();
	console.log(title);

	const iconMap = {
		GameConfig: Joystick,
		LangConfig: Language,
		AssetsPatchConfig: File,
		AudioConfig: Music,
		ScalingConfig: Scale,
		NotificationConfig: Bell,
		FontFallbackConfig: Font,
		SongConfig: Song
	};

	const IconComponent = iconMap[title];
</script>

<div class="card">
	<div class="row">
		{#if IconComponent}
			<div class="iconWrapper">
				<div class="icon">
					<IconComponent />
				</div>
			</div>
		{/if}
	</div>
	<h3>{title}</h3>
	{version}
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1px solid var(--border);
		height: 8rem;
		padding: 0.5rem;
		background-color: var(--foreground);
		border-radius: 0.5rem;
		animation-iteration-count: infinite;
		animation-duration: 1.5s;
		animation-direction: alternate;

		&:hover {
			animation-name: breathe;
			cursor: pointer;

			.icon {
				color: var(--primary);
			}
		}
	}
	.iconWrapper {
		background-color: var(--background);
		padding: 0.5rem;
		border-radius: 50%;
	}
	.icon {
		width: 2rem;
		height: 2rem;
	}
	.row {
		display: flex;
		gap: 0.5rem;
	}
	@keyframes breathe {
		from {
			outline: 0px solid var(--foreground);
		}
		to {
			outline: 5px solid var(--foreground);
		}
	}
</style>

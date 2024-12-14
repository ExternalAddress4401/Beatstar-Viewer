<script lang="ts">
	import Discord from '$lib/icons/discord.svelte';
	import { signIn } from '@auth/sveltekit/client';
	import ButtonLink from './ButtonLink.svelte';
</script>

<div class="navigation">
	<h1>BEATSTAR</h1>
	<ButtonLink label="CMS" href="/cms" />
	<div>
		<button class="button" on:click={() => signIn('discord')}>
			<div class="icon">
				<Discord />
			</div>
		</button>
	</div>
</div>

<style>
	.navigation {
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
		background-color: black;
		border-bottom: 1px solid blue;
		padding: 1rem 2rem;
	}
	.button {
		all: unset;
		cursor: pointer;
	}
	.icon {
		display: flex;
		align-items: center;
		width: 2rem;
		height: 2rem;
	}
</style>

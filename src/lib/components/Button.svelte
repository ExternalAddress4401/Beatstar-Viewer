<script lang="ts">
	let { label } = $props();
</script>

<button class="button">
	{label}
</button>

<style>
	.button {
		all: unset;
		cursor: pointer;
		background-color: var(--secondary);
		padding: 1rem;
		border-radius: 15%;

		&:hover {
			background-color: var(--secondary-light);
		}
	}
</style>

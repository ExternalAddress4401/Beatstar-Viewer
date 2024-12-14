<script lang="ts">
	let { label, href } = $props();
</script>

<a class="button" {href}>
	{label}
</a>

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

<script lang="ts">
	import CmsCard from '$lib/components/CMSCard.svelte';
	import Wrapper from '$lib/components/Wrapper.svelte';

	let { data } = $props();
</script>

<Wrapper>
	<div class="grid">
		{#each data.cms.cms as cms}
			<CmsCard title={cms.name} version={cms.version} />
		{/each}
	</div>
</Wrapper>

<style lang="scss">
	@use '../../lib/mixins' as mx;

	.grid {
		display: grid;
		gap: 1rem;

		@include mx.sm {
			grid-template-columns: repeat(1, 1fr);
		}

		@include mx.md {
			grid-template-columns: repeat(2, 1fr);
		}

		@include mx.lg {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>

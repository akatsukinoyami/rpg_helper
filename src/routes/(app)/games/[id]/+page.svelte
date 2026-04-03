<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<p class="text-sm text-gray-400">{m.game_nav_locations()}</p>
<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime';
	import { mdiCog } from '@mdi/js';
	import Icon from './Icon.svelte';

	interface Props {
		appTitle: string;
	}

	let { appTitle }: Props = $props();
</script>


<nav class="border-b border-gray-200 bg-white">
  <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-1.5">
    <div class="flex items-center gap-6">
      <a href={localizeHref('/')} class="text-base font-semibold text-gray-900">
        {appTitle}
      </a>
    </div>

    <div class="flex items-center gap-4">
      <a href={localizeHref('/settings')} class="text-sm text-gray-500 hover:text-gray-900 group">
        <Icon path={mdiCog} pathClass='fill-gray-500 group-hover:fill-gray-300' />
      </a>
    </div>
  </div>
</nav>
<script lang="ts">
  import { untrack } from 'svelte';
  import Button from '$lib/components/Button.svelte';
	import ButtonRadioSet from '$lib/components/InputButtonRadioSet.svelte';
  import Palette from '$lib/components/Palette.svelte';
  import { langLabels, modeLabels, schemeLabels } from '$lib/constants/labels';
	import * as m from '$lib/paraglide/messages';
	import { saveTheme } from '$lib/remote/settings.remote';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedLocale = $state(untrack(() => data.locale));
	let previewScheme = $state(untrack(() => data.prefs.scheme));
	let previewMode = $state(untrack(() => data.prefs.mode));

	$effect(() => {
		document.documentElement.setAttribute('data-theme', `${previewScheme}-${previewMode}`);
	});
</script>

<form
  {...saveTheme}
  class="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200"
>
  <ButtonRadioSet 
    label={m.settings_lang_label()} 
    name="locale" 
    options={langLabels} 
    bind:group={selectedLocale} 
    labelClass="w-50" 
    inline 
  />
  
  <ButtonRadioSet 
    label={m.settings_scheme_label()} 
    name="scheme" 
    options={schemeLabels} 
    bind:group={previewScheme} 
    labelClass="w-50" 
    inline 
  />
  
  <ButtonRadioSet 
    label={m.settings_mode_label()} 
    name="mode" 
    options={modeLabels} 
    bind:group={previewMode} 
    labelClass="w-50" 
    inline 
  />

  <Palette />

  <div class="flex justify-end">
    <Button label={m.settings_save()} type="submit" />
  </div>
</form>
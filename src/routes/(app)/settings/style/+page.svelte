<script lang="ts">
	import { untrack } from 'svelte';
	import Button from '$lib/components/Button.svelte';
	import ButtonRadioSet from '$lib/components/InputButtonRadioSet.svelte';
	import Message from '$lib/partials/message/Message.svelte';
	import Palette from '$lib/components/Palette.svelte';
	import { langLabels, modeLabels, schemeLabels } from '$lib/constants/labels';
	import * as m from '$lib/paraglide/messages';
	import { saveTheme } from '$lib/remote/settings.remote';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedLocale = $state(untrack(() => data.locale));
	let previewScheme = $state(untrack(() => data.prefs.scheme));
	let previewMode = $state(untrack(() => data.prefs.mode));
	let msgView = $state(untrack(() => data.msgView));

	$effect(() => {
		document.documentElement.setAttribute('data-theme', `${previewScheme}-${previewMode}`);
	});
</script>

<form
  {...saveTheme}
  class="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200"
>
  <ButtonRadioSet
    label={m.settings_msg_view_label()}
    name="msgView"
    options={{ compact: m.settings_msg_view_compact, forum: m.settings_msg_view_forum }}
    bind:group={msgView}
    labelClass="w-50"
    inline
  />

  <div class="flex gap-3 rounded-xl bg-gray-50 p-4">
    <Message msg={{
      id: "id-id-id-id",
      content: `Тяжелая дубовая дверь со скрипом поддалась, впуская внутрь поток холодного ночного воздуха и запах мокрой хвои. Эдриан вошел в зал, стряхивая капли дождя с поношенного плаща. Его взгляд тут же зацепился за фигуру в дальнем углу: незнакомец в глубоком капюшоне сидел неподвижно, водя пальцем по краю кубка.

— *Надеюсь, эль здесь крепче, чем манеры местных вышибал,* — вполголоса проворчал мечник, направляясь прямиком к столу таинственного гостя.

Он отодвинул свободный стул и, не дожидаясь приглашения, сел напротив, положив ладонь на рукоять меча.

— *Говорят, вы искали того, кто не боится заглянуть в шахты Черного Пика? Считайте, что вы его нашли.*`,
      createdAt: new Date(),
      character: { id: null, name: "Эдриан", image: null },
      locationName: "Интересная Локация"
    }} view={msgView} />
  </div>

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
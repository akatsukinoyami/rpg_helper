<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
	import appDia from '$lib/assets/appDia.svg';
	import appMax from '$lib/assets/appMax.svg';
  import { authClient } from '$lib/auth-client';
  import AvatarUpload from '$lib/components/AvatarUpload.svelte';
  import Button from '$lib/components/Button.svelte';
  import HR from '$lib/components/HR.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { providerIcons, providerLabels } from '$lib/constants/labels';
	import * as m from '$lib/paraglide/messages';
	import { saveAccount } from '$lib/remote/settings.remote';
  import { keys } from '$lib/utils';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const errorMsg = (key: string | undefined): string | null => {
		const msgs: Partial<Record<string, () => string>> = {
			wrong_password: m.settings_error_wrong_password,
			name_taken: m.settings_error_name_taken,
			email_taken: m.settings_error_email_taken,
			mismatch: m.settings_error_password_mismatch,
			too_short: m.settings_error_password_too_short,
		};
		return key ? (msgs[key]?.() ?? null) : null;
	};

	async function signOut() {
		await authClient.signOut();
		goto('/sign_in');
	}

	type ConnectedAccount = { providerId: keyof typeof providerLabels };
	let connectedAccounts = $state<ConnectedAccount[]>([]);

	async function fetchAccounts() {
		const result = await authClient.listAccounts();
		connectedAccounts = (result.data ?? []) as ConnectedAccount[];
	}

	async function unlink(providerId: string) {
		await authClient.unlinkAccount({ providerId });
		await fetchAccounts();
	}

	async function link(provider: keyof typeof providerIcons) {
		await authClient.linkSocial({ provider, callbackURL: window.location.href });
	}

	onMount(fetchAccounts);
</script>

<form
  {...saveAccount}
  class="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200"
>
  <AvatarUpload name="image" value={data.user.image} type="user" label={m.settings_avatar_label()} size={40} />
  {#if saveAccount.result?.accountError}
    <p class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
      {errorMsg(saveAccount.result.accountError)}
    </p>
  {/if}

  <InputText 
    id="account-name" 
    name="name" 
    label={m.settings_new_username()} 
    placeholder={data.user.name} 
  />

  <InputText 
    id="account-email" 
    name="email" 
    type="email" 
    label={m.settings_new_email()} 
    placeholder={data.user.email} 
  />
  
  <HR />

  <InputText 
    id="account-new-password" 
    name="newPassword" 
    type="password" 
    label={m.settings_new_password()} 
  />

  <InputText 
    id="account-confirm-password" 
    name="confirmPassword" 
    type="password" 
    label={m.settings_confirm_password()} 
  />

  <HR />

  <InputText 
    id="account-current-password" 
    name="currentPassword" 
    type="password" 
    label={m.settings_current_password()} 
  />

  <HR />

  <div class="flex justify-between items-center">
    <h2 class="text-sm font-medium text-gray-700">{m.settings_connected_providers()}</h2>

    <div class="flex gap-2">
      {#each keys(providerIcons) as provider}
        {@const linked = connectedAccounts.some((a) => a.providerId === provider)}
        <Button
          icon={providerIcons[provider]}
          class={{ 'p-2': true, "grayscale-100": !linked }}
          kind={linked ? 'success' : 'secondary'}
          onclick={() => linked ? unlink(provider) : link(provider)}
        />
      {/each}
      {#each [[appDia, 'Dia'], [appMax, 'Max']] as [src, alt]}
        <Button 
          class='p-2 grayscale-100'
          kind="secondary"
          onclick={() => window.location.href = 'https://youtu.be/dQw4w9WgXcQfor'}
        ><img {src} {alt} width="24px"/></Button>
      {/each}
    </div>
  </div>

  <div class="flex justify-between">
    <Button label={m.nav_signout()} onclick={signOut} kind="danger" />
    <Button label={m.settings_save()} type="submit" />
  </div>
</form>
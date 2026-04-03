<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/Button.svelte';
	import { appDiscord, appGoogle, appTelegram } from '$lib/icons';
	import appDia from '$lib/assets/appDia.svg';
	import appMax from '$lib/assets/appMax.svg';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		providers: { google: boolean; discord: boolean; telegram: boolean };
	}

	let { providers }: Props = $props();

	const any = $derived(providers.google || providers.discord || providers.telegram);

	async function signIn(provider: 'google' | 'discord' | 'telegram') {
		await authClient.signIn.social({ provider, callbackURL: '/games' });
	}
</script>

{#if any}
	<div class="mt-6 flex flex-col gap-3">
		<div class="flex items-center gap-3">
			<div class="h-px flex-1 bg-gray-200"></div>
			<span class="text-xs text-gray-400">{m.auth_or()}</span>
			<div class="h-px flex-1 bg-gray-200"></div>
		</div>

		<div class="flex gap-2 justify-center">
			{#if providers.google}
				<Button 
					class='p-1'
					kind="ghost" 
					icon={appGoogle} 
					iconProps={{ size: 36 }}
					onclick={() => signIn('google')} 
				/>
			{/if}

			{#if providers.discord}
				<Button 
					class='p-1'
					kind="ghost" 
					icon={appDiscord}
					iconProps={{ size: 36 }}
					onclick={() => signIn('discord')} 
				/>
			{/if}

			{#if providers.telegram}
				<Button 
					class='p-1'
					kind="ghost" 
					icon={appTelegram} 
					iconProps={{ size: 36 }}
					onclick={() => signIn('telegram')} 
				/>
			{/if}

			{#each [[appDia, 'Dia'], [appMax, 'Max']] as [src, alt]}
			<Button 
				class='p-1'
				kind="ghost"
				onclick={() => window.location.href = 'https://youtu.be/dQw4w9WgXcQfor'}
			><img {src} {alt} width="36px"/></Button>
			{/each}
		</div>
	</div>
{/if}

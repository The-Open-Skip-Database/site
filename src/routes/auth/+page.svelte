<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getApiKey } from '$lib/tosd';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';
	import { Toaster, toast } from 'svelte-sonner';

	let user: User | null = null;

	let loading = true;
	let key_disabled = false;

	onMount(async () => {
		await checkUser();
		loading = false;
	});

	async function checkUser() {
		user = (await supabase.auth.getUser()).data.user;
	}

	async function signInWithGithub() {
		const res = await supabase.auth.signInWithOAuth({
			provider: 'github'
		});
		if (res.error) console.error('Error logging in with Github:', res.error.message);
	}

	async function signOut() {
		await supabase.auth.signOut();
		user = null;
	}

	async function copyApiKey() {
		key_disabled = true;
		const access_token = (await supabase.auth.getSession()).data.session?.access_token;
		if (!access_token) {
			toast.warning('Error fetching access token.');
			return;
		}

		const api_key = await getApiKey(access_token);
		if (api_key) {
			await navigator.clipboard.writeText(api_key);
			toast.success('API key copied to clipboard.');
		} else {
			toast.error('An error occurred while connecting to the database.');
		}

		setTimeout(() => {
			key_disabled = false;
		}, 5000);
	}
</script>

<svelte:head>
	<title>Auth - The Open Skip Database</title>
</svelte:head>
<main>
	<Toaster theme="dark" richColors />
	{#if loading}
		<p class="text-center">Loading...</p>
	{:else}
		<div class="text-center">
			{#if user}
				<p>You are logged in as <span id="user_email">{user.email}</span></p>
				<button on:click={signOut}>Sign Out</button>
				<button
					on:click={() => {
						window.location.href = '/';
					}}>Go home</button
				>
				<button on:click={copyApiKey} disabled={key_disabled}>Copy API key</button>
			{:else}
				<button on:click={signInWithGithub}>Sign In with Github</button>
			{/if}
		</div>
	{/if}
</main>

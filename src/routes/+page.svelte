<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import type { User } from '@supabase/supabase-js';
	import { goto } from '$app/navigation';
	import Search from '$components/Search.svelte';
	import Form from '$components/Form.svelte';
	import { Toaster, toast } from 'svelte-sonner';

	let show_results: boolean = false;
	let tmdb_search: string;

	let user: User | null = null;
	let tmdb_id: number;
	let type: 'movie' | 'tv';

	onMount(async () => {
		user = (await supabase.auth.getUser()).data.user;
		if (!user) {
			goto('/auth');
			return;
		}
		document.addEventListener('click', handleClickOutside);
	});

	const handleSelect = (e: { detail: { tmdb_id: number; type: 'movie' | 'tv' } }) => {
		tmdb_id = e.detail.tmdb_id;
		type = e.detail.type;
	};

	const handleClickOutside = (e) => {
		if (!e.target.closest('#search-container')) {
			show_results = false;
		}
	};

	const handleResult = (e: { detail: boolean | null }) => {
		const media = type === 'movie' ? 'Movie' : 'Episode';
		const abcs = type === 'movie' ? 'a' : 'an';

		if (e.detail) {
			toast.success(`Successfully contributed ${abcs} ${media.toLowerCase()} to the database.`);
		} else if (e.detail === false) {
			toast.error(`${media} already exists in the database.`);
		} else {
			toast.error('An error occurred while connecting to the database.');
		}
	};
</script>

<svelte:head>
	<title>The Open Skip Database</title>
</svelte:head>
<main>
	<Toaster theme="dark" richColors />
	{#if !user}
		<p>Loading...</p>
	{:else}
		<div class="flex flex-col">
			<Search on:select={handleSelect} {tmdb_search} {show_results} />
			<Form on:result={handleResult} {tmdb_id} {type} />
		</div>
	{/if}
</main>

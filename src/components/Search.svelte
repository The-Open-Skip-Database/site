<script lang="ts">
	import { PUBLIC_TMDB_API_KEY } from '$env/static/public';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let tmdb_search;
	export let show_results;
	let tmdb_id: number;
	let results: any[] = [];
	let type: 'movie' | 'tv' = 'movie';

	let timeout: NodeJS.Timeout | null = null;

	const selectItem = (id: number, genre: string) => {
		tmdb_id = id;
		results = [];
		tmdb_search = '';
		type = genre === 'movie' ? 'movie' : 'tv';
		dispatch('select', { tmdb_id, type });
	};

	const searchTmdb = () => {
		if (tmdb_search.length <= 1) return [];
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(async () => {
			let response = await fetch(
				`https://api.themoviedb.org/3/search/multi?query=${tmdb_search}&language=en-US&page=1`,
				{
					headers: {
						Authorization: `Bearer ${PUBLIC_TMDB_API_KEY}`
					}
				}
			);

			let data = await response.json();
			if (!data.results) return [];

			data.results.sort((a, b) => {
				if (a.vote_count > b.vote_count) return -1;
				if (a.vote_count < b.vote_count) return 1;
				return 0;
			});

			results = data.results.filter(
				(result) =>
					result[type === 'movie' ? 'release_date' : 'first_air_date'] !== '' &&
					result.media_type !== 'person'
			);
		}, 250);
	};
</script>

<div class="relative" id="search-container">
	<input
		type="text"
		bind:value={tmdb_search}
		on:focus={() => (show_results = true)}
		on:input={() => {
			searchTmdb();
			show_results = true;
		}}
		name="tmdb"
		placeholder="Search for a title..."
		class="mb-2 min-w-max w-full"
	/>
	{#if show_results && results.length > 0}
		<div id="search" class="absolute z-20 w-full max-h-64">
			{#each results as result}
				<button
					class="p-2 border-b border-gray-200 block hover:bg-slate-200 transition-colors duration-200 w-full text-left"
					on:click={() => selectItem(result.id, result.media_type)}
				>
					<h2>
						{result.original_title ?? result.name} - {result.release_date ?? result.first_air_date}
					</h2>
				</button>
			{/each}
		</div>
	{/if}
</div>

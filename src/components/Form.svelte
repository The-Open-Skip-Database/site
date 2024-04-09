<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { postEpisode, postMovie } from '$lib/tosd';
	import { supabase } from '$lib/supabase';

	export let type: 'movie' | 'tv';
	export let tmdb_id: number;

	let intro_start: string;
	let intro_end: string;
	let season: number;
	let episode: number;
	let outro_start: string;
	let key_disabled = false;

	const dispatch = createEventDispatcher();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const access_token = (await supabase.auth.getSession()).data.session?.access_token;
		if (!access_token) {
			return;
		}

		let res: boolean | null;
		if (type === 'tv') {
			res = await postEpisode(
				{
					season,
					episode,
					intro_start: intro_start ? timeToSeconds(intro_start) : null,
					intro_end: intro_end ? timeToSeconds(intro_end) : null,
					outro_start: timeToSeconds(outro_start)
				},
				tmdb_id,
				access_token
			);
		} else {
			res = await postMovie({ outro_start: timeToSeconds(outro_start) }, tmdb_id, access_token);
		}

		key_disabled = true;
		setTimeout(() => {
			key_disabled = false;
		}, 5000);

		dispatch('result', res);
	};

	const timeToSeconds = (time: string) => {
		let timeParts = time.split(':').map(Number);
		let hours: number, minutes: number, seconds: number;

		if (timeParts.length === 3) {
			[hours, minutes, seconds] = timeParts;
			return hours * 3600 + minutes * 60 + seconds;
		} else if (timeParts.length === 2) {
			[minutes, seconds] = timeParts;
			return minutes * 60 + seconds;
		} else {
			return timeParts[0];
		}
	};

	const formatTime = (time: string, id: string) => {
		let value = time.replace(/\D/g, '');

		if (value.length > 2) {
			value = value.slice(0, -2) + ':' + value.slice(-2);
		}
		if (value.length > 5) {
			value = value.slice(0, -5) + ':' + value.slice(-5);
		}

		switch (id) {
			case 'intro_start':
				intro_start = value;
				break;
			case 'intro_end':
				intro_end = value;
				break;
			case 'outro_start':
				outro_start = value;
				break;
		}
	};
</script>

<form on:submit={handleSubmit} class="flex flex-col items-start">
	<div class="w-full">
		<div>
			<label for="tmdb">TMDB ID</label>
			<input
				type="text"
				bind:value={tmdb_id}
				name="tmdb"
				placeholder="TMDB ID"
				required
				pattern="\d{'{'}1,7}"
			/>
		</div>
		{#if type === 'tv'}
			<div class="w-full">
				<label for="intro_start">Intro Start</label>
				<input
					type="text"
					bind:value={intro_start}
					on:input={() => formatTime(intro_start, 'intro_start')}
					name="intro_start"
					placeholder="X:XX:XX"
				/>
			</div>
			<div class="w-full">
				<label for="intro_end">Intro End</label>
				<input
					type="text"
					bind:value={intro_end}
					on:input={() => formatTime(intro_end, 'intro_end')}
					name="intro_end"
					placeholder="X:XX:XX"
				/>
			</div>
		{/if}
		<div class="w-full">
			<label for="outro_start">Outro Start</label>
			<input
				type="text"
				bind:value={outro_start}
				on:input={() => formatTime(outro_start, 'outro_start')}
				name="outro_start"
				placeholder="X:XX:XX"
				required
			/>
		</div>
		<button type="submit" class="m-0 mt-auto" id="submit" disabled={key_disabled}>Submit</button>
	</div>
	{#if type === 'tv'}
		<div>
			<div>
				<label for="season">Season</label>
				<input type="number" bind:value={season} name="season" placeholder="Season" required />
			</div>
			<div>
				<label for="episode">Episode</label>
				<input type="number" bind:value={episode} name="episode" placeholder="Episode" required />
			</div>
		</div>
	{/if}
</form>

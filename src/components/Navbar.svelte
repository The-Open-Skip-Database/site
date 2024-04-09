<script lang="ts">
	import { supabase } from '$lib/supabase';
	import type { User } from '@supabase/supabase-js';
	import { onMount } from 'svelte';

	let user: User | null = null;

	onMount(async () => {
		user = (await supabase.auth.getUser()).data.user;
	});

	supabase.auth.onAuthStateChange(async (event, _) => {
		if (event === 'SIGNED_OUT') {
			user = null;
		}
	});
</script>

<nav class="absolute right-3 top-4">
	{#if user}
		<a href="/auth">
			<img
				src={user?.user_metadata['avatar_url']}
				alt="Your GitHub avatar"
				width="50"
				class="rounded-3xl"
			/>
		</a>
	{/if}
</nav>

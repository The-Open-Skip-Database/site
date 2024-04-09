const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

interface EpisodeData {
	season: number;
	episode: number;
	intro_start: number | null;
	intro_end: number | null;
	outro_start: number;
}

interface MovieData {
	outro_start: number;
}

export async function postMovie(
	data: MovieData,
	tmdb_id: number,
	access_token: string
): Promise<boolean | null> {
	if (!tmdb_id || !data) {
		return false;
	}

	try {
		const res = await fetch(`${API_BASE}/movie`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`
			},
			body: JSON.stringify({ tmdb_id, ...data })
		});

		return res.ok;
	} catch (e) {
		return null;
	}
}

export async function postEpisode(
	data: EpisodeData,
	tmdb_id: number,
	access_token: string
): Promise<boolean | null> {
	if (!tmdb_id || !data) {
		return false;
	}

	try {
		const res = await fetch(`${API_BASE}/series`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`
			},
			body: JSON.stringify({ tmdb_id, ...data })
		});

		return res.ok;
	} catch (e) {
		return null;
	}
}

export async function getApiKey(access_token: string): Promise<string | null> {
	try {
		const res = await fetch(`${API_BASE}/auth`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${access_token}`
			}
		});

		if (!res.ok) {
			return null;
		}

		const data = await res.json();
		return data.api_key;
	} catch (e) {
		return null;
	}
}

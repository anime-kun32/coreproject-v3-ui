export interface Anime {
	id: string;
	mal_id: number;
	name: string;
	japanese_name: string;
	type: string;
	aired_from: string;
	aired_to: string;
	cover: string;
	synopsis: string;
	updated: string;
	studios: string[];
	genres: string[];
	episodes_count: number;
}

export const latest_animes: Anime[] = [];

async function loadLatestAnimes() {
	try {
		const res = await fetch('https://no-drab.vercel.app/meta/anilist/trending');
		const data = await res.json();

		const transformed = data.results.map((item): Anime => ({
			id: item.id,
			mal_id: item.malId,
			name: item.title.english || item.title.romaji || 'Unknown Title',
			japanese_name: item.title.native || item.title.romaji || 'Unknown',
			type: item.type || 'TV',
			aired_from: new Date().toISOString(),
			aired_to: new Date().toISOString(),
			cover: item.image,
			synopsis: item.description || 'No synopsis available.',
			updated: new Date().toISOString(),
			studios: ['Unknown Studio'], 
			genres: item.genres || [],
			episodes_count: item.totalEpisodes || 1
		}));

		latest_animes.push(...transformed);
	} catch (error) {
		console.error('Failed to fetch latest animes:', error);
	}
}

// Auto-fetch when the module is imported
loadLatestAnimes();

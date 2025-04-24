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

// Exported variable to hold the anime data
export let latest_animes: Anime[] = [];

async function loadLatestAnimes() {
	try {
		const res = await fetch('https://no-drab.vercel.app/meta/anilist/trending');
		const data = await res.json();

		latest_animes = data.results.map((item: any): Anime => ({
			id: item.id,
			mal_id: item.id,
			name: item.title.english || item.title.romaji || 'Unknown Title',
			japanese_name: item.title.native || item.title.romaji || 'Unknown',
			type: item.type || 'TV',
			aired_from: item.startDate?.year
				? new Date(`${item.startDate.year}-${item.startDate.month || 1}-${item.startDate.day || 1}`).toISOString()
				: new Date().toISOString(),
			aired_to: item.endDate?.year
				? new Date(`${item.endDate.year}-${item.endDate.month || 1}-${item.endDate.day || 1}`).toISOString()
				: new Date().toISOString(),
			cover: item.cover || '',
			synopsis: item.description || 'No synopsis available.',
			updated: new Date().toISOString(),
			studios: item.studios?.map((s: any) => s.name) || ['Unknown Studio'],
			genres: item.genres || [],
			episodes_count: item.totalEpisodes || 1
		}));
	} catch (error) {
		console.error('Failed to fetch latest animes:', error);
	}
}

// Auto-load when the module is imported
loadLatestAnimes();

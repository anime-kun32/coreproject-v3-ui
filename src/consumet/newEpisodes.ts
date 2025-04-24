export interface Episode {
	id: number;
	name: string;
	cover: string;
	episode_number: number;
	release_date: string;
	synopsis: string;
}

export const latest_episodes: Episode[] = [];

async function loadLatestEpisodes() {
	const query = `
		query ($page: Int, $perPage: Int, $now: Int) {
			Page(page: $page, perPage: $perPage) {
				airingSchedules(sort: TIME_DESC, airingAt_lesser: $now) {
					episode
					airingAt
					media {
						id
						title {
							romaji
							english
						}
						coverImage {
							large
						}
						description(asHtml: false)
					}
				}
			}
		}
	`;

	const now = Math.floor(Date.now() / 1000);

	const variables = {
		page: 1,
		perPage: 50,
		now
	};

	try {
		const res = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({ query, variables })
		});

		const json = await res.json();
		const episodes = json.data.Page.airingSchedules;

		// Deduplicate by anime ID + episode number
		const seen = new Set();
		const uniqueEpisodes = episodes.filter(ep => {
			const key = `${ep.media.id}-${ep.episode}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		// Transform and store
		const transformed = uniqueEpisodes.map((ep): Episode => ({
			id: ep.media.id,
			name: ep.media.title.english || ep.media.title.romaji || "Unknown",
			cover: ep.media.coverImage.large,
			episode_number: ep.episode,
			release_date: new Date(ep.airingAt * 1000).toISOString(),
			synopsis: ep.media.description || "No synopsis available."
		}));

		latest_episodes.push(...transformed);
	} catch (error) {
		console.error("Error fetching latest episodes from AniList:", error);
	}
}

// Auto-run when imported
loadLatestEpisodes();

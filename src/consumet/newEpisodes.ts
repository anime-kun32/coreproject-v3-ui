export interface LatestEpisode {
  id: number;
  name: string;
  cover: string;
  episode_number: number;
  release_date: string;
  synopsis: string;
}

export const fetchLatestEpisodes = async (): Promise<LatestEpisode[]> => {
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
    now,
  };

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();
    const allEpisodes = json?.data?.Page?.airingSchedules || [];

    const seen = new Set<string>();
    const latest_episodes: LatestEpisode[] = allEpisodes
      .filter((ep: any) => {
        const key = `${ep.media.id}-${ep.episode}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((ep: any) => ({
        id: ep.media.id,
        name: ep.media.title.english || ep.media.title.romaji || "Unknown",
        cover: ep.media.coverImage.large,
        episode_number: ep.episode,
        release_date: new Date(ep.airingAt * 1000).toISOString(),
        synopsis: ep.media.description || "No synopsis available.",
      }));

    return latest_episodes;
  } catch (err) {
    console.error("Error fetching from AniList:", err);
    return [];
  }
};

// If you want to auto-export it directly (e.g. for SSR or quick test)
export const latest_episodes = await fetchLatestEpisodes();

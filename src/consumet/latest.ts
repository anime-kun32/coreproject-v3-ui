interface APIAnime {
  id: string;
  malId: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  image: string;
  description: string;
  status: string;
  rating: number;
  releaseDate: number;
  type: string;
  genres: string[];
  totalEpisodes: number;
}

interface APIResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: APIAnime[];
}

// 🎯 Replace with the actual API endpoint
const API_URL = 'https://no-drab.vercel.app/meta/anilist/trending';

export interface LatestAnime {
  id: number;
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

export let latest_animes: LatestAnime[] = [];

export async function loadLatestAnimes(): Promise<void> {
  try {
    const res = await fetch(API_URL);
    const data: APIResponse = await res.json();

    latest_animes = data.results.map((anime, index) => ({
      id: index + 1,
      mal_id: anime.malId,
      name: anime.title.english || anime.title.romaji,
      japanese_name: anime.title.native || anime.title.romaji,
      type: anime.type,
      aired_from: new Date(anime.releaseDate, 0, 1).toISOString(),
      aired_to: new Date(anime.releaseDate, 11, 31).toISOString(), // assume same year
      cover: anime.image,
      synopsis: anime.description.replace(/<\/?[^>]+(>|$)/g, ""),
      updated: new Date().toISOString(),
      studios: ["Unknown Studio"], // placeholder if not in API
      genres: anime.genres,
      episodes_count: anime.totalEpisodes || 0,
    }));
  } catch (error) {
    console.error('Failed to load latest animes:', error);
  }
}

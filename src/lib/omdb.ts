// src/lib/omdb.ts
// Utility to fetch a movie poster from OMDB by title and year

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';
const OMDB_SEARCH_URL = 'https://www.omdbapi.com/';

export async function fetchPosterUrl(title: string, year: string): Promise<string | null> {
  if (!OMDB_API_KEY) {
    return null;
  }

  const url = `${OMDB_SEARCH_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    if (data.Poster && data.Poster !== 'N/A') {
      return data.Poster;
    }

    return null;
  } catch {
    return null;
  }
}

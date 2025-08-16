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

// Attempt to find a representative image for a character by name using OMDB's search API.
// We first search by the raw name, then try a Star Wars-qualified query.
export async function fetchCharacterImageUrl(name: string): Promise<string | null> {
  if (!OMDB_API_KEY) {
    return null;
  }

  const queries = [name, `Star Wars ${name}`];

  for (const q of queries) {
    const url = `${OMDB_SEARCH_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        continue;
      }
      const data = await res.json();
      const items = Array.isArray(data?.Search) ? data.Search : [];
      const withPoster = items.find((it: any) => it?.Poster && it.Poster !== 'N/A');
      if (withPoster) {
        return withPoster.Poster as string;
      }
    } catch {
      // ignore and try next query
    }
  }

  return null;
}

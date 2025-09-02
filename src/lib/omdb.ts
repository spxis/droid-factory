// src/lib/omdb.ts
// Utility to fetch a movie poster from OMDB by title and year

// Full OMDB search results for a character name (deduped, with posters only)
import type { OMDBSearchItem, OMDBMovieDetails } from '@/types';

const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';
const OMDB_SEARCH_URL = import.meta.env.VITE_OMDB_API_URL || 'https://www.omdbapi.com/';

async function fetchPosterUrl(title: string, year: string): Promise<string | null> {
  if (!OMDB_API_KEY) {
    return null;
  }

  const url = `${OMDB_SEARCH_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

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
async function fetchCharacterImageUrl(name: string): Promise<string | null> {
  if (!OMDB_API_KEY) {
    return null;
  }

  const queries = [name, `Star Wars ${name}`];

  for (const query of queries) {
    const url = `${OMDB_SEARCH_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        continue;
      }
        
      const data: { Search?: Array<{ Poster?: string }>; [k: string]: unknown } = await response.json();
      const items = Array.isArray(data?.Search) ? data.Search : [];
      const withPoster = items.find((item) => item?.Poster && item.Poster !== 'N/A');

      if (withPoster) {
        return withPoster.Poster as string;
      }
    } catch {
      // ignore and try next query
    }
  }

  return null;
}

async function fetchCharacterSearchResults(name: string): Promise<OMDBSearchItem[]> {
  if (!OMDB_API_KEY) {
    return [];
  }

  const queries = [name, `Star Wars ${name}`];
  const seen = new Set<string>();
  const results: OMDBSearchItem[] = [];

  for (const query of queries) {
    const url = `${OMDB_SEARCH_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {continue;}

      const data: { Search?: OMDBSearchItem[] } = await response.json();
      const items = Array.isArray(data?.Search) ? data.Search : [];

      for (const item of items) {
        if (!item || !item.imdbID) {continue;}
        if (!item.Poster || item.Poster === 'N/A') {continue;}
        if (seen.has(item.imdbID)) {continue;}

        seen.add(item.imdbID);
        results.push(item);
      }
    } catch {
      // ignore this query
    }
  }

  return results;
}

// Detailed OMDB response for a movie title + year
async function fetchMovieDetails(title: string, year?: string): Promise<OMDBMovieDetails | null> {
  if (!OMDB_API_KEY) {
    return null;
  }
  const url = `${OMDB_SEARCH_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}${year ? `&y=${year}` : ''}`;
  try {
    const response = await fetch(url);
    
    if (!response.ok) {return null;}

    const data = await response.json();

    if (data?.Response === 'True' && data?.imdbID) {
      return data as OMDBMovieDetails;
    }

    return null;
  } catch {
    return null;
  }
}

export { fetchPosterUrl, fetchCharacterImageUrl, fetchCharacterSearchResults, fetchMovieDetails };

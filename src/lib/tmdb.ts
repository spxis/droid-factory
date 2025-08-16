// src/lib/tmdb.ts
// Utility to fetch a movie poster from TMDB by title and year

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export async function fetchPosterUrl(title: string, year: string): Promise<string | null> {
  if (!TMDB_API_KEY) return null;
  const url = `${TMDB_SEARCH_URL}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const posterPath = data.results?.[0]?.poster_path;
    return posterPath ? `${TMDB_IMAGE_BASE}${posterPath}` : null;
  } catch {
    return null;
  }
}

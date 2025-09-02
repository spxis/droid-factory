import { useEffect, useMemo, useState } from "react";

import { fetchPosterUrl } from "@/lib/omdb";
import { Film } from "@/types";

const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';

const useFilmPosters = (films: Film[]) => {
  const [posters, setPosters] = useState<Record<string, string>>({});

  const filmKeys = useMemo(() => films.map(f => f.id).join('|'), [films]);

  useEffect(() => {
    let cancelled = false;

    const missing = films.filter((film: Film) => !posters[film.id]);
    if (missing.length === 0) {
      return () => { cancelled = true; };
    }

    async function fetchMissing(): Promise<void> {
      const entries = await Promise.all(
        missing.map(async (film: Film) => {
          const url: string | null = await fetchPosterUrl(
            film.title,
            film.releaseDate?.slice(0, 4)
          );
          return [film.id, url || FALLBACK_POSTER] as const;
        })
      );

      if (cancelled) { return; }

      setPosters((prev) => {
        const next = { ...prev } as Record<string, string>;
        for (const [id, url] of entries) {
          next[id] = url;
        }
        return next;
      });
    }

    fetchMissing();
    return () => { cancelled = true; };
  }, [filmKeys]);

  return posters;

}

export { useFilmPosters };
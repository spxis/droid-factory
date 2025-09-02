import { useEffect, useMemo, useState } from "react";

import { fetchPosterUrl } from "@/lib/omdb";
import { Film } from "@/types";

const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';

// In-memory cache survives route changes within the SPA
const postersCache = new Map<string, string>();
const STORAGE_KEY = 'df.posterUrls.v1';

const useFilmPosters = (films: Film[]) => {
  const [posters, setPosters] = useState<Record<string, string>>(() => {
    // Seed from memory cache and localStorage (if present)
    let stored: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      stored = {};
    }

    const initial: Record<string, string> = {};
    for (const f of films) {
      const mem = postersCache.get(f.id);
      const persisted = stored[f.id];
      if (mem) { initial[f.id] = mem; }
      else if (persisted) { initial[f.id] = persisted; postersCache.set(f.id, persisted); }
    }
    return initial;
  });

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
          postersCache.set(id, url);
        }
        // Persist a compact map for future reloads
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore quota/errors
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
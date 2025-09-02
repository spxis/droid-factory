import { useEffect, useMemo, useState } from "react";

import type { PosterFilmInput } from "@/types";

import { FALLBACK_POSTER, POSTER_STORAGE_KEY } from "@/lib/constants";
import { fetchPosterUrl } from "@/lib/omdb";
import { extractYear } from "@/utils/date";

// In-memory cache survives route changes within the SPA
const postersCache = new Map<string, string>();
const STORAGE_KEY = POSTER_STORAGE_KEY;

type PostersMap = Record<string, string>;

const useFilmPosters = (films: PosterFilmInput[]): PostersMap => {
  const [posters, setPosters] = useState<PostersMap>(() => {
    // Seed from memory cache and localStorage (if present)
    let stored: Record<string, string> = {};

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      stored = {};
    }

    const initial: PostersMap = {};
    for (const film of films) {
      const mem = postersCache.get(film.id);
      const persisted = stored[film.id];

      if (mem) { initial[film.id] = mem; }
      else if (persisted) { initial[film.id] = persisted; postersCache.set(film.id, persisted); }
    }
    return initial;
  });

  const filmKeys = useMemo(() => films.map((film) => film.id).join('|'), [films]);

  useEffect(() => {
    let cancelled = false;

    const missing = films.filter((film: PosterFilmInput) => !posters[film.id]);
    if (missing.length === 0) {
      return () => { cancelled = true; };
    }

    async function fetchMissing(): Promise<void> {
      const entries = await Promise.all(
        missing.map(async (film: PosterFilmInput) => {
          const url: string | null = await fetchPosterUrl(
            film.title,
            extractYear(film.releaseDate) || ''
          );
          return [film.id, url || FALLBACK_POSTER] as const;
        })
      );

      if (cancelled) { return; }

      setPosters((prev) => {
        const next: PostersMap = { ...prev };

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
  }, [filmKeys, posters, films]);

  return posters;

}

export { useFilmPosters };
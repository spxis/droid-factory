import { useEffect, useMemo, useState } from "react";

import { fetchMovieDetails } from "@/lib/omdb";
import { OmdbLite } from "@/types";
import { extractYear } from "@/utils/date";

const cache = new Map<string, { poster: string; omdb: OmdbLite }>();

function useOmdbDetails(title?: string, releaseDate?: string) {
  const [poster, setPoster] = useState<string | null>(null);
  const [omdb, setOmdb] = useState<OmdbLite | null>(null);

  const year = extractYear(releaseDate);
  const key = useMemo(() => (title ? `${title}|${year || ''}` : ''), [title, year]);

  useEffect(() => {
    let cancelled = false;

    if (!key) {
      setPoster(null);
      setOmdb(null);
      return () => { cancelled = true; };
    }

    // Return cached if available
    const hit = cache.get(key);
    if (hit) {
      setPoster(hit.poster);
      setOmdb(hit.omdb);
      return () => { cancelled = true; };
    }

    const fetchDetails = async () => {
      try {
        const details = await fetchMovieDetails(title!, year);
        if (cancelled) { return; }

        const payload: { poster: string; omdb: OmdbLite } = {
          poster: details?.Poster || '',
          omdb: {
            plot: details?.Plot,
            metascore: details?.Metascore,
            genre: details?.Genre,
            runtime: details?.Runtime,
            imdbID: details?.imdbID,
            imdbRating: details?.imdbRating,
          } as OmdbLite,
        };

        cache.set(key, payload);
        setPoster(payload.poster);
        setOmdb(payload.omdb);
      } catch {
        // swallow; page already has a fallback
      }
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };

  }, [key, title, year]);

  return { poster, omdb };
}

export { useOmdbDetails };
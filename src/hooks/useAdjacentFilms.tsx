import { useMemo } from 'react';

import { useFilms } from './useFilms';

import type { Film } from '@/types';

/**
 * Derive the previous and next films relative to a given film id.
 *
 * Ordering source:
 * - Uses the sorted array from useFilms(), matching the Movies page order
 *   (releaseDate asc). No separate neighbor map to keep in sync.
 *
 * Input:
 * - currentId: the film id to anchor from (can be undefined/null).
 *
 * Returns:
 * - previous and next Film objects, or null at the list boundaries/not found.
 */
type AdjacentFilms = { previous: Film | null; next: Film | null };

function useAdjacentFilms(currentId?: string | null): AdjacentFilms {
  const { films } = useFilms();

  return useMemo(() => {
    // Guard: no anchor id provided
    if (!currentId) {
      return {
        previous: null, next: null
      };
    }

    // Find the anchor film in the current list
    const index = films.findIndex((film: Film) => film.id === currentId);

    if (index === -1) {
      return {
        previous: null, next: null
      };
    }

    // Compute neighbors with bounds checks
    const previous = index > 0 ? films[index - 1] : null;
    const next = index < films.length - 1 ? films[index + 1] : null;

    return { previous, next };
  }, [currentId, films]);
}

export { useAdjacentFilms };
export type { AdjacentFilms };

import { memo, useMemo } from 'react';

import type { DetailsCardProps } from '@/types';

function DetailsCard({ film, labels, omdb }: DetailsCardProps) {
  const L = useMemo(() => ({
    episode: 'Episode',
    director: 'Director',
    producers: 'Producers',
    ...labels,
  } as const), [labels]);
  const year = useMemo(() => (film.releaseDate ? film.releaseDate.slice(0, 4) : null), [film.releaseDate]);

  return (
    <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-lg font-semibold mb-2">Details</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{L.episode}</dt>
          <dd className="text-zinc-100 mt-0.5">{film.episodeID}</dd>
        </div>
        {year && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">Year</dt>
            <dd className="text-zinc-100 mt-0.5">{year}</dd>
          </div>
        )}
        {film.director && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{L.director}</dt>
            <dd className="text-zinc-100 mt-0.5">{film.director}</dd>
          </div>
        )}
        {film.producers && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{L.producers}</dt>
            <dd className="text-zinc-100 mt-0.5">{film.producers.join(', ')}</dd>
          </div>
        )}
        {omdb?.genre && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">Genre</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.genre}</dd>
          </div>
        )}
        {omdb?.runtime && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">Runtime</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.runtime}</dd>
          </div>
        )}
        {omdb?.imdbRating && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">IMDb Rating</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.imdbRating}</dd>
          </div>
        )}
        {omdb?.metascore && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">Metascore</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.metascore}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export { DetailsCard };
export default memo(DetailsCard);

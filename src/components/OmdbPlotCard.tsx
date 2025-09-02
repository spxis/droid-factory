import { memo } from 'react';

import type { OmdbPlotCardProps } from '@/types';

function OmdbPlotCard({ plot, imdbID }: OmdbPlotCardProps) {
  if (!plot) { return null; }

  return (
    <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-lg font-semibold mb-2">Plot</h3>
      <p className="text-zinc-200/95 leading-7">{plot}</p>
      {imdbID && (
        <a
          href={`https://www.imdb.com/title/${imdbID}/`}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-yellow-300 hover:text-yellow-200"
        >
                    View on IMDb
        </a>
      )}
    </div>
  );
}

export { OmdbPlotCard };
export default memo(OmdbPlotCard);

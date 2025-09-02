import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { DetailsCardProps } from '@/types';

import { extractYear } from '@/utils/date';

function DetailsCard({ film, labels, omdb }: DetailsCardProps) {
  const { t } = useTranslation();
  const effectiveLabels = useMemo(() => ({
    episode: t('detail.labels.episode'),
    director: t('detail.labels.director'),
    producers: t('detail.labels.producers'),
    ...labels,
  } as const), [labels, t]);
  const year = useMemo(() => extractYear(film.releaseDate), [film.releaseDate]);

  return (
    <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-lg font-semibold mb-2">{t('detail.labels.details', 'Details')}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{effectiveLabels.episode}</dt>
          <dd className="text-zinc-100 mt-0.5">{film.episodeID}</dd>
        </div>
        {year && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{t('detail.labels.year', 'Year')}</dt>
            <dd className="text-zinc-100 mt-0.5">{year}</dd>
          </div>
        )}
        {film.director && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{effectiveLabels.director}</dt>
            <dd className="text-zinc-100 mt-0.5">{film.director}</dd>
          </div>
        )}
        {film.producers && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{effectiveLabels.producers}</dt>
            <dd className="text-zinc-100 mt-0.5">{film.producers.join(', ')}</dd>
          </div>
        )}
        {omdb?.genre && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{t('detail.labels.genre')}</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.genre}</dd>
          </div>
        )}
        {omdb?.runtime && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{t('detail.labels.runtime')}</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.runtime}</dd>
          </div>
        )}
        {omdb?.imdbRating && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{t('detail.labels.imdbRating')}</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.imdbRating}</dd>
          </div>
        )}
        {omdb?.metascore && (
          <div>
            <dt className="uppercase tracking-widest text-[10px] text-zinc-400">{t('detail.labels.metascore')}</dt>
            <dd className="text-zinc-100 mt-0.5">{omdb.metascore}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

export { DetailsCard };
export default memo(DetailsCard);

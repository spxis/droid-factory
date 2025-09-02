import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

import CharactersCard from '@/components/CharactersCard';
import DetailsCard from '@/components/DetailsCard';
import OmdbPlotCard from '@/components/OmdbPlotCard';
import OpeningCrawlCard from '@/components/OpeningCrawlCard';
import PosterCard from '@/components/PosterCard';
import TitleCard from '@/components/TitleCard';
import { useAdjacentFilms } from '@/hooks/useAdjacentFilms';
import { useFilmBySlug } from '@/hooks/useFilmBySlug';
import { useOmdbDetails } from '@/hooks/useOmdbDetails';
import { useSlugMap } from '@/hooks/useSlugMap';
import { FALLBACK_POSTER } from '@/lib/constants';
import { extractYear } from '@/utils/date';

const MovieDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const passed = (location.state as { id?: string; posterUrl?: string } | null) || null;
  const passedId = passed?.id;

  const { film, loading, error } = useFilmBySlug(slug, passedId);
  const { idToSlug } = useSlugMap();
  const { previous, next } = useAdjacentFilms(film?.id ?? null);
  const { poster, omdb } = useOmdbDetails(film?.title, film?.releaseDate);

  // Memoized values must be declared before any early returns
  const omdbBundle = useMemo(
    () => ({
      genre: omdb?.genre ?? null,
      runtime: omdb?.runtime ?? null,
      imdbRating: omdb?.imdbRating ?? null,
      metascore: omdb?.metascore ?? null,
    }),
    [omdb?.genre, omdb?.runtime, omdb?.imdbRating, omdb?.metascore]
  );

  if (loading) {
    return <p>{t('detail.loading')}</p>;
  }
  if (error) {
    return <p>{t('detail.error')}</p>;
  }

  if (!film) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{t('detail.notFoundTitle')}</h1>
        <p className="mb-4">{t('detail.notFoundBody')}</p>
        <Link className="text-yellow-400" to="/">
          {t('detail.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6">
      <Link className="text-yellow-400 hover:text-yellow-300 transition-colors" to="/">
        {t('detail.back')}
      </Link>

      <section className="mt-4 rounded-2xl ring-1 ring-yellow-900/25 bg-gradient-to-b from-zinc-900/70 to-black/60 shadow-xl shadow-black/30 p-5 md:p-8">
        {/* Stack content vertically and center key elements */}
        <div className="flex flex-col items-center gap-5 md:gap-6">
          <PosterCard src={passed?.posterUrl || poster} alt={film.title} fallbackSrc={FALLBACK_POSTER} />
          <TitleCard
            title={film.title}
            episodeID={film.episodeID ?? null}
            releaseDate={film.releaseDate ?? null}
            imdbRating={omdb?.imdbRating ?? null}
            genre={omdb?.genre ?? null}
            runtime={omdb?.runtime ?? null}
            labels={{ episode: t('detail.labels.episode') }}
          />

          {/* Prev/Next navigation */}
          <div className="w-full flex items-center justify-between text-sm text-zinc-300">
            <div>
              {previous ? (
                <Link
                  to={`/movies/${idToSlug[previous.id]}`}
                  state={{ id: previous.id }}
                  className="text-yellow-400 hover:text-yellow-300 select-none"
                >
                  &lt; {previous.title} {extractYear(previous.releaseDate) ? (
                    <span className="text-zinc-400">({extractYear(previous.releaseDate)})</span>
                  ) : null}
                </Link>
              ) : <span />}
            </div>
            <div>
              {next ? (
                <Link
                  to={`/movies/${idToSlug[next.id]}`}
                  state={{ id: next.id }}
                  className="text-yellow-400 hover:text-yellow-300 select-none"
                >
                  {next.title} {extractYear(next.releaseDate) ? (
                    <span className="text-zinc-400">({extractYear(next.releaseDate)})</span>
                  ) : null} &gt;
                </Link>
              ) : <span />}
            </div>
          </div>

          {/* Cards grid for Crawl, Details, Plot, Characters */}
          <div className="w-full grid grid-cols-1 gap-4">
            <OpeningCrawlCard crawl={film.openingCrawl} />
            <DetailsCard
              film={film}
              labels={{
                episode: t('detail.labels.episode'),
                director: t('detail.labels.director'),
                producers: t('detail.labels.producers'),
              }}
              omdb={omdbBundle}
            />
            <OmdbPlotCard plot={omdb?.plot} imdbID={omdb?.imdbID} />
            <CharactersCard characters={film.characterConnection?.characters} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetailPage;

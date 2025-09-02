import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

import CharactersCard from '@/components/CharactersCard';
import DetailsCard from '@/components/DetailsCard';
import OmdbPlotCard from '@/components/OmdbPlotCard';
import OpeningCrawlCard from '@/components/OpeningCrawlCard';
import PosterCard from '@/components/PosterCard';
import TitleCard from '@/components/TitleCard';
import { useFilmBySlug } from '@/hooks/useFilmBySlug';
import { useOmdbDetails } from '@/hooks/useOmdbDetails';
import { FALLBACK_POSTER } from '@/lib/constants';


const LOADING_MESSAGE = 'detail.loading';
const ERROR_MESSAGE = 'detail.error';
const NOT_FOUND_TITLE = 'detail.notFoundTitle';
const NOT_FOUND_BODY = 'detail.notFoundBody';
const BACK_TO_LIST = 'detail.backToList';
const BACK = 'detail.back';
const LABEL_EPISODE = 'detail.labels.episode';
const LABEL_DIRECTOR = 'detail.labels.director';
const LABEL_PRODUCERS = 'detail.labels.producers';

const MovieDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const passed = (location.state as { id?: string; posterUrl?: string } | null) || null;
  const passedId = passed?.id;

  const { film, loading, error } = useFilmBySlug(slug, passedId);
  const { poster, omdb } = useOmdbDetails(film?.title, film?.releaseDate);

  // Memoized values must be declared before any early returns
  const omdbBundle = useMemo(() => ({
    genre: omdb?.genre ?? null,
    runtime: omdb?.runtime ?? null,
    imdbRating: omdb?.imdbRating ?? null,
    metascore: omdb?.metascore ?? null,
  }), [omdb?.genre, omdb?.runtime, omdb?.imdbRating, omdb?.metascore]);

  if (loading) { return <p>{t(LOADING_MESSAGE)}</p>; }
  if (error) { return <p>{t(ERROR_MESSAGE)}</p>; }

  if (!film) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{t(NOT_FOUND_TITLE)}</h1>
        <p className="mb-4">{t(NOT_FOUND_BODY)}</p>
        <Link className="text-yellow-400" to="/">{t(BACK_TO_LIST)}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6">
      <Link className="text-yellow-400 hover:text-yellow-300 transition-colors" to="/">{t(BACK)}</Link>

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
            labels={{ episode: t(LABEL_EPISODE) }}
          />

          {/* Cards grid for Crawl, Details, Plot, Characters */}
          <div className="w-full grid grid-cols-1 gap-4">
            <OpeningCrawlCard crawl={film.openingCrawl} />
            <DetailsCard
              film={film}
              labels={{ episode: t(LABEL_EPISODE), director: t(LABEL_DIRECTOR), producers: t(LABEL_PRODUCERS) }}
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

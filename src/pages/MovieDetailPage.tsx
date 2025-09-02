import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import CharactersCard from '@/components/CharactersCard';
import DetailsCard from '@/components/DetailsCard';
import OmdbPlotCard from '@/components/OmdbPlotCard';
import OpeningCrawlCard from '@/components/OpeningCrawlCard';
import PosterCard from '@/components/PosterCard';
import TitleCard from '@/components/TitleCard';
import { useFilmBySlug } from '@/hooks/useFilmBySlug';
import { useOmdbDetails } from '@/hooks/useOmdbDetails';

const FALLBACK_POSTER = 'https://placehold.co/400x600/0b0b0b/9ca3af?text=No+Poster';

const LOADING_MESSAGE = 'Loading...';
const ERROR_MESSAGE = 'Error loading film';
const NOT_FOUND_TITLE = 'Not Found';
const NOT_FOUND_BODY = "We couldn't find that movie.";
const BACK_TO_LIST = '← Back to list';
const BACK = '← Back';
const LABEL_EPISODE = 'Episode';
const LABEL_DIRECTOR = 'Director';
const LABEL_PRODUCERS = 'Producers';

const MovieDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const passed = (location.state as { id?: string; posterUrl?: string } | null) || null;
  const passedId = passed?.id;

  const { film, loading, error } = useFilmBySlug(slug, passedId);
  const { poster, omdb } = useOmdbDetails(film?.title, film?.releaseDate);

  // Memoized values must be declared before any early returns
  const detailsLabels = useMemo(() => ({ episode: LABEL_EPISODE, director: LABEL_DIRECTOR, producers: LABEL_PRODUCERS }), []);
  const titleLabels = useMemo(() => ({ episode: LABEL_EPISODE }), []);
  const omdbBundle = useMemo(() => ({
    genre: omdb?.genre ?? null,
    runtime: omdb?.runtime ?? null,
    imdbRating: omdb?.imdbRating ?? null,
    metascore: omdb?.metascore ?? null,
  }), [omdb?.genre, omdb?.runtime, omdb?.imdbRating, omdb?.metascore]);

  if (loading) { return <p>{LOADING_MESSAGE}</p>; }
  if (error) { return <p>{ERROR_MESSAGE}</p>; }

  if (!film) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{NOT_FOUND_TITLE}</h1>
        <p className="mb-4">{NOT_FOUND_BODY}</p>
        <Link className="text-yellow-400" to="/">{BACK_TO_LIST}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6">
      <Link className="text-yellow-400 hover:text-yellow-300 transition-colors" to="/">{BACK}</Link>

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
            labels={titleLabels}
          />

          {/* Cards grid for Crawl, Details, Plot, Characters */}
          <div className="w-full grid grid-cols-1 gap-4">
            <OpeningCrawlCard crawl={film.openingCrawl} />
            <DetailsCard
              film={film}
              labels={detailsLabels}
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

import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchPosterUrl } from '../lib/omdb';
import { slugifyTitle } from '../lib/slug';

import type { Film } from '../types';

const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';
const LOADING_MESSAGE = 'Loading...';
const ERROR_MESSAGE = 'Error loading film';

const FILMS_QUERY = gql`
  query Films {
    allFilms {
      films {
        id
        title
        episodeID
        releaseDate
        openingCrawl
        director
        producers
      }
    }
  }
`;

const MovieDetailPage = () => {
    const { slug } = useParams();
    const { data, loading, error } = useQuery(FILMS_QUERY);
    const films: Film[] = useMemo(() => data?.allFilms?.films || [], [data]);
    const film: Film | undefined = useMemo(
        () => films.find((f: Film) => slugifyTitle(f.title) === slug),
        [films, slug]
    );

    const [poster, setPoster] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        async function run() {
            if (!film) { return; }
            const url = await fetchPosterUrl(film.title, film.releaseDate?.slice(0, 4));
            if (cancelled) { return; }
            setPoster(url || FALLBACK_POSTER);
        }
        run();
        return () => { cancelled = true; };
    }, [film]);

    if (loading) { return <p>{LOADING_MESSAGE}</p>; }
    if (error) { return <p>{ERROR_MESSAGE}</p>; }
    if (!film) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-4">Not Found</h1>
                <p className="mb-4">We couldn&apos;t find that movie.</p>
                <Link className="text-yellow-400" to="/">← Back to list</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Link className="text-yellow-400" to="/">← Back</Link>
            <div className="mt-4 grid gap-6 md:grid-cols-[240px,1fr]">
                <div>
                    <div className="w-full h-auto">
                        {/* Poster */}
                        <img
                            src={poster || FALLBACK_POSTER}
                            alt={film.title}
                            className="w-full max-w-xs rounded-lg object-cover"
                        />
                    </div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-2">{film.title}</h1>
                    <div className="text-sm opacity-80 mb-4">
                        Episode {film.episodeID} • {film.releaseDate?.slice(0, 4)}
                    </div>
                    {film.openingCrawl && (
                        <p className="whitespace-pre-line leading-relaxed opacity-90 mb-4">{film.openingCrawl}</p>
                    )}
                    <div className="text-sm opacity-80">
                        {film.director && <div>Director: {film.director}</div>}
                        {film.producers && (
                            <div>Producers: {film.producers.join(', ')}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetailPage;

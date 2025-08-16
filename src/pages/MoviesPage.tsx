// Reusable FilmCard component
import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';

import FilmCard, { Film } from '../components/FilmCard';
import { fetchPosterUrl } from '../lib/omdb';

// Apollo query result type
interface FilmsQueryResult {
    allFilms: {
        films: Film[];
    };
}

// DRY constants
const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';
const LOADING_MESSAGE = 'Loading...';
const ERROR_MESSAGE = 'Error loading films';

const FILMS_QUERY = gql`
  query Films {
    allFilms {
      films {
        id
        title
        episodeID
        releaseDate
      }
    }
  }
`;

const MoviesPage = () => {
    const { data, loading, error } = useQuery<FilmsQueryResult>(FILMS_QUERY);
    const films: Film[] = useMemo(() => data?.allFilms?.films || [], [data]);
    const [posters, setPosters] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;

        const missing = films.filter((film: Film) => !posters[film.id]);
        if (missing.length === 0) {
            return () => { cancelled = true; };
        }

        async function fetchMissing(): Promise<void> {
            const entries = await Promise.all(
                missing.map(async (film: Film) => {
                    const url: string | null = await fetchPosterUrl(
                        film.title,
                        film.releaseDate?.slice(0, 4)
                    );
                    return [film.id, url || FALLBACK_POSTER] as const;
                })
            );
            if (cancelled) { return; }
            setPosters((prev) => {
                const next = { ...prev } as Record<string, string>;
                for (const [id, url] of entries) {
                    next[id] = url;
                }
                return next;
            });
        }

        fetchMissing();
        return () => { cancelled = true; };
    }, [films, posters]);

    if (loading) { return <p>{LOADING_MESSAGE}</p>; }
    if (error) { return <p>{ERROR_MESSAGE}</p>; }

    return (
        <div className="w-full">
            <h1 className="text-2xl font-bold mb-8 text-center">Star Wars Movies</h1>

            <div className="grid gap-4 md:gap-8 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))] lg:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
                {films.map((film) => {
                    const imgUrl = posters[film.id] || FALLBACK_POSTER;

                    return <FilmCard key={film.id} film={film} posterUrl={imgUrl} />;
                })}
            </div>
        </div>
    );
};

export default MoviesPage;
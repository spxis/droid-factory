// Reusable FilmCard component
import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';

import FilmCard from '../components/FilmCard';
import { fetchPosterUrl } from '../lib/omdb';

import type { Film, FilmsQueryResult } from '../types';

const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';
const LOADING_MESSAGE = 'Loading...';
const ERROR_MESSAGE = 'Error loading films';
const HEADING_TITLE = 'Star Wars Movies';

const FILMS_QUERY = gql`
    query Films {
        allFilms {
            films {
                id
                title
                episodeID
                releaseDate
            }
            edges { node { id title episodeID releaseDate } }
            totalCount
        }
    }
`;

const MoviesPage = () => {
    const { data, loading, error } = useQuery<FilmsQueryResult>(FILMS_QUERY);
    const films: Film[] = useMemo(() => {
        const byList = data?.allFilms?.films ?? [];
        const byEdges = (data?.allFilms?.edges ?? []).map((e: any) => e?.node).filter(Boolean) as Film[];
        return byList.length ? byList : byEdges;
    }, [data]);
    useEffect(() => {
        if (data) {
            console.log('[MoviesPage] allFilms.totalCount:', data.allFilms?.totalCount);
            console.log('[MoviesPage] films count:', films.length);
        }
    }, [data, films]);
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
        <div className="w-full max-w-[1200px] mx-auto px-4">
            <h1 className="text-2xl font-bold mb-8 text-center">{HEADING_TITLE}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 justify-center place-items-center">
                {films.map((film) => {
                    const imgUrl = posters[film.id] || FALLBACK_POSTER;

                    return <FilmCard key={film.id} film={film} posterUrl={imgUrl} />;
                })}
            </div>
        </div>
    );
};

export default MoviesPage;
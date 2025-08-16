// Reusable FilmCard component
import { gql, useQuery } from '@apollo/client';
import FilmCard, { Film } from '../components/FilmCard';
import { useEffect, useState } from 'react';
import { fetchPosterUrl } from '../lib/omdb';

// Apollo query result type
interface FilmsQueryResult {
    allFilms: {
        films: Film[];
    };
}

// DRY constants
const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';

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
    const films: Film[] = data?.allFilms?.films || [];
    const [posters, setPosters] = useState<Record<string, string>>({});

    useEffect(() => {
        let cancelled = false;
        async function fetchAllPosters(): Promise<void> {
            const newPosters: Record<string, string> = {};
            await Promise.all(
                films.map(async (film: Film) => {
                    if (posters[film.id]) {
                        newPosters[film.id] = posters[film.id];
                        return;
                    }
                    const url: string | null = await fetchPosterUrl(
                        film.title,
                        film.releaseDate?.slice(0, 4)
                    );
                    newPosters[film.id] = url || FALLBACK_POSTER;
                })
            );
            if (!cancelled) setPosters(newPosters);
        }
        if (films.length) fetchAllPosters();
        return () => { cancelled = true; };
    }, [films]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading films</p>;

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
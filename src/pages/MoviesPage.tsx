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
                    const url: string | null = await fetchPosterUrl(film.title, film.releaseDate?.slice(0, 4));
                    newPosters[film.id] = url || 'https://placehold.co/400x600?text=No+Poster';
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
            <h1 className="text-2xl font-bold mb-4 text-center">Star Wars Movies</h1>

            {/* Auto-fill columns with a small min tile width; no gaps */}
            <div className="grid gap-0 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] lg:[grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">

                {films.map((film) => {
                    const imgUrl = posters[film.id] || 'https://placehold.co/400x600?text=No+Poster';
                    return <FilmCard key={film.id} film={film} posterUrl={imgUrl} />;
                })}
            </div>
        </div>
    );
};

export default MoviesPage;
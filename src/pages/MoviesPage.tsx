// Reusable FilmCard component
import type { Film } from '../types';

import FilmCard from '../components/FilmCard';
import { useFilmPosters } from '../hooks/useFilmPosters';

import { useFilms } from '../hooks/useFilms';

const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';
const LOADING_MESSAGE = 'Loading...';
const ERROR_MESSAGE = 'Error loading films';
const HEADING_TITLE = 'Star Wars Movies';

const MoviesPage = () => {
    const { films, totalCount, loading, error } = useFilms();
    const posters = useFilmPosters(films as Film[]);

    if (loading) { return <p>{LOADING_MESSAGE}</p>; }
    if (error) { return <p>{ERROR_MESSAGE}</p>; }

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4">
            <h1 className="text-2xl font-bold mb-8 text-center">{HEADING_TITLE} ({totalCount})</h1>

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
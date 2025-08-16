import { Link } from 'react-router-dom';

import { slugifyTitle } from '../lib/slug';

import type { Film } from '../types';

const LABEL_EPISODE = 'Episode';

interface FilmCardProps {
    film: Film;
    posterUrl: string;
}

const FilmCard: React.FC<FilmCardProps> = ({ film, posterUrl }) => (
    <Link
        to={`/movies/${slugifyTitle(film.title)}`}
        state={{ id: film.id }}
        className="block group transition-transform duration-200 hover:scale-105 no-underline"
    >
        <div className="w-full overflow-hidden rounded-lg bg-black">
            <div className="w-full h-40 sm:h-48 md:h-56">
                <img
                    src={posterUrl}
                    alt={film.title}
                    className="w-full h-full object-cover block rounded-lg"
                />
            </div>
        </div>

        {/* Caption beneath poster, centered like Sonarr/Radarr */}
        <div className="mt-3 text-center text-white">
            <div className="font-bold text-base sm:text-lg truncate">{film.title}</div>
            <div className="text-xs sm:text-sm opacity-80">{LABEL_EPISODE} {film.episodeID}</div>
        </div>
    </Link>
);

export default FilmCard;

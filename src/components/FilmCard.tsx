import { Link } from 'react-router-dom';

import type { Film } from '@/types';

import { slugifyTitle } from '@/lib/slug';


const LABEL_EPISODE = 'Episode';

interface FilmCardProps {
    film: Film;
    posterUrl: string;
}

const FilmCard: React.FC<FilmCardProps> = ({ film, posterUrl }) => (
    <Link
        to={`/movies/${slugifyTitle(film.title)}`}
        state={{ id: film.id }}
        className="block group transition-transform duration-200 hover:scale-105 no-underline max-w-[300px] w-full mx-auto"
    >
        <div className="w-full overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40">
            <div className="w-full aspect-[2/3]">
                <img
                    src={posterUrl}
                    alt={film.title}
                    className="w-full h-full object-cover block"
                />
            </div>
        </div>

        {/* Caption beneath poster, centered like Sonarr/Radarr */}
        <div className="mt-3 text-center text-white">
            <div className="font-bold text-lg sm:text-xl truncate">{film.title}</div>
            <div className="text-sm sm:text-base opacity-80">{LABEL_EPISODE} {film.episodeID}</div>
        </div>
    </Link>
);

export default FilmCard;

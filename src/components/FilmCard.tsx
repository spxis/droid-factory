import { Link } from 'react-router-dom';

export interface Film {
    id: string;
    title: string;
    episodeID: number;
    releaseDate: string;
}

interface FilmCardProps {
    film: Film;
    posterUrl: string;
}

const FilmCard: React.FC<FilmCardProps> = ({ film, posterUrl }) => (
    <Link
        to={`/movie/${encodeURIComponent(film.id)}`}
        className="block relative group transition-transform duration-200 hover:scale-105 text-white visited:text-white hover:text-white active:text-white no-underline"
        style={{ textDecoration: 'none' }}
    >
        <div className="w-full h-[200px] overflow-hidden bg-black rounded-lg">
            <img
                src={posterUrl}
                alt={film.title}
                className="w-full h-full object-cover block rounded-lg"
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/90 via-black/60 to-transparent rounded-b-lg pointer-events-none" />
        </div>
        {/* Title and episode text over the gradient */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col z-10 text-white">
            <div className="font-bold text-base drop-shadow-md truncate">{film.title}</div>
            <div className="text-xs drop-shadow-md">Episode {film.episodeID}</div>
        </div>
    </Link>
);

export default FilmCard;

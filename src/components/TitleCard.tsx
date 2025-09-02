import type { TitleCardProps } from '@/types';

function TitleCard({ title, episodeID, releaseDate, imdbRating, genre, runtime, labels }: TitleCardProps) {
    const year = releaseDate ? releaseDate.slice(0, 4) : null;
    const L = { episode: 'Episode', ...(labels || {}) } as const;

    return (
        <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-4 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{title}</h1>

            <div className="text-base md:text-lg text-zinc-300">
                {episodeID != null && <span>{L.episode} {episodeID}</span>}
                {year && <span>{episodeID != null ? ' • ' : ''}{year}</span>}
                {imdbRating && <span> • IMDb {imdbRating}</span>}
            </div>

            {genre && <div className="mt-1 text-sm text-zinc-400">{genre}</div>}
            {runtime && <div className="mt-0.5 text-sm text-zinc-400">{runtime}</div>}
        </div>
    );
}

export { TitleCard };
export default TitleCard;

import type { PosterCardProps } from '@/types';

function PosterCard({ src, alt, fallbackSrc }: PosterCardProps) {
    const url = src || fallbackSrc;

    return (
        <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-3">
            <div className="w-[300px] max-w-full aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40 mx-auto">
                <img src={url} alt={alt} className="h-full w-full object-cover" />
            </div>
        </div>
    );
}

export { PosterCard };
export default PosterCard;

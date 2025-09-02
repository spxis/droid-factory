import { memo, useMemo } from 'react';

import type { PosterCardProps } from '@/types';

function PosterCard({ src, alt, fallbackSrc }: PosterCardProps) {
  const url = useMemo(() => src || fallbackSrc, [src, fallbackSrc]);

  return (
    <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-3">
      <div className="w-[300px] max-w-full aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40 mx-auto">
        <img
          src={url}
          alt={alt}
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover bg-zinc-900 opacity-0 transition-opacity duration-300"
          onLoad={(event) => { event.currentTarget.classList.remove('opacity-0'); }}
          {...({ fetchpriority: 'high' } as Record<string, string>)}
        />
      </div>
    </div>
  );
}

export { PosterCard };
export default memo(PosterCard);

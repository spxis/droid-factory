import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';

import type { CharactersCardProps } from '@/types';

function CharactersCard({ characters }: CharactersCardProps) {
    const list = characters ?? [];
    const sorted = useMemo(() => [...list].sort((a, b) => a.name.localeCompare(b.name)), [list]);
    if (list.length === 0) { return null; }

    return (
        <div className="rounded-xl ring-1 ring-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="text-lg font-semibold mb-3">Characters</h3>
            <div className="flex flex-wrap gap-2">
                {sorted.map((c) => (
                    <Link
                        key={c.id}
                        to={`/characters/${c.id}`}
                        title={`${c.name}${c.species ? ` • ${c.species.name}` : ''}${c.homeworld ? ` • ${c.homeworld.name}` : ''}`}
                        className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-100 px-3.5 py-0.5 text-xs font-medium text-zinc-900 shadow-sm transition-colors transition-transform duration-200 hover:bg-white hover:text-black hover:border-zinc-500 hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-yellow-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-700/40"
                    >
                        {c.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}

export { CharactersCard };
export default memo(CharactersCard);

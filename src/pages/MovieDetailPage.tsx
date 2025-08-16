import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { fetchPosterUrl } from '../lib/omdb';
import { slugifyTitle } from '../lib/slug';
import { useSlugMap } from '../lib/slugMap';

import type { Character, FilmDetails } from '../types';

const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';
const LOADING_MESSAGE = 'Loading...';
const ERROR_MESSAGE = 'Error loading film';
const NOT_FOUND_TITLE = 'Not Found';
const NOT_FOUND_BODY = "We couldn't find that movie.";
const BACK_TO_LIST = '← Back to list';
const BACK = '← Back';
const LABEL_EPISODE = 'Episode';
const LABEL_DIRECTOR = 'Director';
const LABEL_PRODUCERS = 'Producers';

const FILM_DETAIL_QUERY = gql`
    query FilmById($id: ID!) {
        film(id: $id) {
            id
            title
            episodeID
            releaseDate
            openingCrawl
            director
            producers
            characterConnection {
                characters {
                    id
                    name
                    species { id name }
                    homeworld { id name }
                }
            }
        }
    }
`;

const MovieDetailPage = () => {
    const { slug } = useParams();
    const location = useLocation();
    const { slugToId, ready } = useSlugMap();
    const passedId = (location.state as { id?: string } | null)?.id;
    const idFromMap = slug ? slugToId[slug] : undefined;
    const resolvedId = passedId || idFromMap;

    const { data, loading, error } = useQuery<{ film: FilmDetails }>(FILM_DETAIL_QUERY, {
        skip: !resolvedId,
        variables: { id: resolvedId },
    });
    const film = data?.film;

    const [poster, setPoster] = useState<string | null>(null);

    // Normalize the opening crawl: collapse single line-breaks into spaces and
    // split paragraphs on blank lines so we don't render hard-coded line wraps.
    const crawlParagraphs: string[] = useMemo(() => {
        const raw = film?.openingCrawl;
        if (!raw) { return []; }
        const normalized = raw
            .replace(/\r\n?/g, '\n') // CRLF/CR -> LF
            .trim();
        // Split on 2+ newlines for paragraphs
        const blocks = normalized.split(/\n{2,}/);
        return blocks
            .map((b) => b.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim())
            .filter(Boolean);
    }, [film?.openingCrawl]);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            if (!film) { return; }
            const url = await fetchPosterUrl(film.title, film.releaseDate?.slice(0, 4));
            if (cancelled) { return; }
            setPoster(url || FALLBACK_POSTER);
        }
        run();
        return () => { cancelled = true; };
    }, [film]);

    if (loading || !ready) { return <p>{LOADING_MESSAGE}</p>; }
    if (error) { return <p>{ERROR_MESSAGE}</p>; }
    if (!film) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-4">{NOT_FOUND_TITLE}</h1>
                <p className="mb-4">{NOT_FOUND_BODY}</p>
                <Link className="text-yellow-400" to="/">{BACK_TO_LIST}</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6">
            <Link className="text-yellow-400 hover:text-yellow-300 transition-colors" to="/">{BACK}</Link>

            <section className="mt-4 rounded-2xl ring-1 ring-yellow-900/25 bg-gradient-to-b from-zinc-900/70 to-black/60 shadow-xl shadow-black/30 p-5 md:p-8">
                {/* Stack content vertically and center key elements */}
                <div className="flex flex-col items-center gap-5 md:gap-6">
                    {/* Poster */}
                    <div className="w-[300px] max-w-full aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40">
                        <img
                            src={poster || FALLBACK_POSTER}
                            alt={film.title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Title and meta */}
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                            {film.title}
                        </h1>
                        <div className="text-base md:text-lg text-zinc-300">
                            {LABEL_EPISODE} {film.episodeID}
                            {film.releaseDate && <span> • {film.releaseDate.slice(0, 4)}</span>}
                        </div>
                    </div>

                    {/* Opening crawl as paragraphs without hard line breaks */}
                    {crawlParagraphs.length > 0 && (
                        <div className="max-w-prose text-left space-y-4 text-lg md:text-xl leading-8 text-zinc-200/95">
                            {crawlParagraphs.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    )}

                    {/* Details cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-base">
                        {film.director && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_DIRECTOR}</div>
                                <div className="text-zinc-100 mt-1">{film.director}</div>
                            </div>
                        )}
                        {film.producers && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_PRODUCERS}</div>
                                <div className="text-zinc-100 mt-1">{film.producers.join(', ')}</div>
                            </div>
                        )}
                    </div>

                    {/* Characters */}
                    {film.characterConnection?.characters?.length ? (
                        <div className="w-full mt-6">
                            <h2 className="text-xl font-bold mb-3">Characters</h2>
                            <div className="flex flex-wrap gap-2">
                                {film.characterConnection.characters.map((c: Character) => (
                                    <Link
                                        key={c.id}
                                        to={`/characters/${slugifyTitle(c.name)}`}
                                        state={{ id: c.id }}
                                        title={`${c.name}${c.species ? ` • ${c.species.name}` : ''}${c.homeworld ? ` • ${c.homeworld.name}` : ''}`}
                                        className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-100 px-3.5 py-0.5 text-xs font-medium text-zinc-900 shadow-sm transition-colors transition-transform duration-200 hover:bg-white hover:text-black hover:border-zinc-500 hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-yellow-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-700/40"
                                    >
                                        {c.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>
        </div>
    );
};

export default MovieDetailPage;

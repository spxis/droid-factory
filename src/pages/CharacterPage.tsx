import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchCharacterImageUrl, fetchCharacterSearchResults, fetchPosterUrl } from '../lib/omdb';
import type { OMDBSearchItem } from '../types';
import { slugifyTitle } from '../lib/slug';
import CharacterCard from '../components/CharacterCard';
import { decodeGlobalId } from '../lib/swapiId';

const LOADING_MESSAGE = 'Loading...';
const ERROR_MESSAGE = 'Error loading character';
const NOT_FOUND_TITLE = 'Not Found';
const NOT_FOUND_BODY = "We couldn't find that character.";
const BACK = '← Back';
const LABEL_SPECIES = 'Species';
const LABEL_HOMEWORLD = 'Homeworld';
const LABEL_FILMS = 'Films';
const LABEL_BIRTH_YEAR = 'Birth Year';
const LABEL_GENDER = 'Gender';
const LABEL_HEIGHT = 'Height';
const LABEL_MASS = 'Mass';
const LABEL_EYE_COLOR = 'Eye Color';
const LABEL_HAIR_COLOR = 'Hair Color';
const LABEL_SKIN_COLOR = 'Skin Color';
const FALLBACK_IMAGE = 'https://placehold.co/300x450?text=No+Image';
const FALLBACK_POSTER = 'https://placehold.co/400x600?text=No+Poster';
const VISUAL_GUIDE_BASE = 'https://starwars-visualguide.com/assets/img/characters';

const CHARACTER_QUERY = gql`
    query CharacterById($id: ID!) {
        person(id: $id) {
            id
            name
            birthYear
            gender
            height
            mass
            eyeColor
            hairColor
            skinColor
            species { id name }
            homeworld { id name }
            filmConnection(first: 50) {
                    films { id title releaseDate }
                    edges { node { id title releaseDate } }
                    totalCount
            }
        }
    }
`;

// Fallback: some people occasionally have an empty filmConnection; when that happens,
// we fetch all films with their character lists and filter by this person id.
const ALL_FILMS_WITH_CHARACTERS = gql`
    query AllFilmsWithCharacters {
        allFilms {
            films {
                id
                title
                releaseDate
                characterConnection {
                    characters { id }
                }
            }
        }
    }
`;

// Preload an image and resolve true if it loads (not 404), else false
function checkImage(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// (formatting helpers moved into CharacterCard)


const CharacterPage = () => {
    const { id } = useParams();
    const finalId = id;

    // Debug: log the resolved ID param
    useEffect(() => {
        if (finalId) {
            console.log('[CharacterPage] finalId:', finalId);
        } else {
            console.log('[CharacterPage] No finalId resolved yet');
        }
    }, [finalId]);

    const { data, loading, error } = useQuery<{ person: any }>(CHARACTER_QUERY, {
        skip: !finalId,
        variables: { id: finalId },
    });

    // Secondary query only if the direct film connection yields nothing
    const { data: allFilmsData } = useQuery<{ allFilms: { films: Array<{ id: string; title: string; releaseDate?: string; characterConnection?: { characters?: Array<{ id: string }> } }> } }>(
        ALL_FILMS_WITH_CHARACTERS,
        { skip: !finalId }
    );

    // Debug: log GraphQL data when it arrives
    useEffect(() => {
        if (data) {
            console.log('[CharacterPage] raw data:', data);
            console.log('[CharacterPage] person:', data.person);
            console.log('[CharacterPage] films (films):', data.person?.filmConnection?.films);
            console.log('[CharacterPage] films (edges):', data.person?.filmConnection?.edges?.map?.((e: any) => e?.node));
        }
    }, [data]);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [omdbResults, setOmdbResults] = useState<OMDBSearchItem[]>([]);

    useEffect(() => {
        let cancelled = false;
        async function run() {
            const name = data?.person?.name;
            if (!name) { return; }

            let url: string | null = null;

            // 1) Try Star Wars Visual Guide by decoded numeric id
            const gid = data?.person?.id as string | undefined;
            if (gid) {
                const { numericId } = decodeGlobalId(gid);
                if (numericId) {
                    const vgUrl = `${VISUAL_GUIDE_BASE}/${numericId}.jpg`;
                    if (await checkImage(vgUrl)) {
                        url = vgUrl;
                    }
                }
            }

            // 2) Try character-specific image via OMDB
            if (!url) {
                url = await fetchCharacterImageUrl(name);
            }

            // 3) Fallback: if no character image found, try first film's poster

            if (!url) {
                const filmsFromFilms = (data?.person?.filmConnection?.films ?? []) as Array<{ id: string; title: string; releaseDate?: string }>;
                const filmsFromEdges = ((data?.person?.filmConnection?.edges ?? []) as Array<{ node?: { id: string; title: string; releaseDate?: string } }>)
                    .map((e) => e?.node)
                    .filter(Boolean) as Array<{ id: string; title: string; releaseDate?: string }>;
                const films = filmsFromFilms.length ? filmsFromFilms : filmsFromEdges;

                if (films.length) {
                    // Sort by release year ascending and pick the first
                    const sorted = [...films].sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''));
                    const first = sorted[0];

                    if (first?.title && first?.releaseDate) {
                        url = await fetchPosterUrl(first.title, first.releaseDate.slice(0, 4));
                    }
                }
            }

            if (!cancelled) {
                setImageUrl(url || FALLBACK_IMAGE);
            }
        }
        run();
        return () => { cancelled = true; };
    }, [data?.person?.id, data?.person?.name, data?.person?.filmConnection?.films, data?.person?.filmConnection?.edges]);

    // Fetch and store OMDB search results for this character name
    useEffect(() => {
        let cancelled = false;
        async function run() {
            const name = data?.person?.name;

            if (!name) { return; }
            const items = await fetchCharacterSearchResults(name);

            if (cancelled) { return; }

            // Filter out posters that 404 by preloading them
            const checks = await Promise.all(
                items.map((it) => (it.Poster ? checkImage(it.Poster) : Promise.resolve(false)))
            );

            if (cancelled) { return; }

            const filtered = items.filter((_, i) => checks[i]);
            setOmdbResults(filtered);
        }
        run();
        return () => { cancelled = true; };
    }, [data?.person?.name]);

    // Compute person and films (merge, dedupe, sort) early so hooks below can depend on them
    const person = data?.person;
    const filmsFromFilms = (person?.filmConnection?.films ?? []) as Array<{ id: string; title: string; releaseDate?: string }>;
    const filmsFromEdges = ((person?.filmConnection?.edges ?? []) as Array<{ node?: { id: string; title: string; releaseDate?: string } }>)
        .map((e) => e?.node)
        .filter(Boolean) as Array<{ id: string; title: string; releaseDate?: string }>;
    let filmsMerged = (filmsFromFilms.length ? filmsFromFilms : filmsFromEdges) as Array<{ id: string; title: string; releaseDate?: string }>;

    // Fallback: if still empty, compute films by scanning all films where this character appears
    if (filmsMerged.length === 0 && allFilmsData?.allFilms?.films?.length && person?.id) {
        const personId = person.id as string;
        const viaAllFilms = allFilmsData.allFilms.films
            .filter((f) => (f.characterConnection?.characters ?? []).some((ch) => ch?.id === personId))
            .map((f) => ({ id: f.id, title: f.title, releaseDate: f.releaseDate }));

        if (viaAllFilms.length) {
            console.log('[CharacterPage] using fallback via allFilms; matched', viaAllFilms.length, 'films');
        }
        filmsMerged = viaAllFilms as Array<{ id: string; title: string; releaseDate?: string }>;
    }

    // Dedupe by id and sort by release year asc
    const filmMap = new Map<string, { id: string; title: string; releaseDate?: string }>();
    for (const f of filmsMerged) { filmMap.set(f.id, f); }
    const films = Array.from(filmMap.values()).sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''));

    // Fetch OMDB posters for each film shown
    const [filmPosters, setFilmPosters] = useState<Record<string, string>>({});
    useEffect(() => {
        let cancelled = false;
        const missing = films.filter((f) => !filmPosters[f.id]);

        if (missing.length === 0) { return () => { cancelled = true; }; }

        async function run() {
            const entries = await Promise.all(
                missing.map(async (f) => {
                    const year = f.releaseDate ? f.releaseDate.slice(0, 4) : '';
                    const url = await fetchPosterUrl(f.title, year);
                    return [f.id, url || FALLBACK_POSTER] as const;
                })
            );
            if (cancelled) return;
            setFilmPosters((prev) => {
                const next = { ...prev } as Record<string, string>;
                for (const [id, url] of entries) next[id] = url;
                return next;
            });
        }

        run();
        return () => { cancelled = true; };
    }, [films, filmPosters]);

    if (loading) { return <p>{LOADING_MESSAGE}</p>; }

    if (error) {
        console.error('[CharacterPage] error:', error);
        return <p>{ERROR_MESSAGE}</p>;
    }

    if (!person) {
        return (
            <div className="max-w-[800px] mx-auto px-4">
                <Link className="text-yellow-400" to="/">{BACK}</Link>
                <h1 className="text-2xl font-bold mb-2">{NOT_FOUND_TITLE}</h1>
                <p className="mb-4">{NOT_FOUND_BODY}</p>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6">
            <Link className="text-yellow-400 hover:text-yellow-300 transition-colors" to="/">{BACK}</Link>

            <section className="mt-4 rounded-2xl ring-1 ring-yellow-900/25 bg-gradient-to-b from-zinc-900/70 to-black/60 shadow-xl shadow-black/30 p-5 md:p-8">
                <div className="flex flex-col items-center gap-4">
                    <CharacterCard
                        name={person.name}
                        imageUrl={imageUrl}
                        fallbackImage={FALLBACK_IMAGE}
                        labels={{
                            species: LABEL_SPECIES,
                            homeworld: LABEL_HOMEWORLD,
                            birthYear: LABEL_BIRTH_YEAR,
                            gender: LABEL_GENDER,
                            height: LABEL_HEIGHT,
                            mass: LABEL_MASS,
                            eyeColor: LABEL_EYE_COLOR,
                            hairColor: LABEL_HAIR_COLOR,
                            skinColor: LABEL_SKIN_COLOR,
                        }}
                        speciesName={person.species?.name}
                        homeworldName={person.homeworld?.name}
                        vitals={{
                            birthYear: person.birthYear,
                            gender: person.gender,
                            height: person.height,
                            mass: person.mass,
                            eyeColor: person.eyeColor,
                            hairColor: person.hairColor,
                            skinColor: person.skinColor,
                        }}
                    />

                    {/* Films */}
                    <div className="w-full mt-4">
                        <h2 className="text-xl font-bold mb-3">
                            {LABEL_FILMS}
                            <span className="ml-2 text-sm font-normal text-zinc-400">
                                ({films.length})
                            </span>
                        </h2>
                        {films.length === 0 ? (
                            <div className="text-sm text-zinc-400">No films found.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {films.map((f: any) => {
                                    const poster = filmPosters[f.id] || FALLBACK_POSTER;
                                    const year = f.releaseDate?.slice(0, 4) || '';
                                    return (
                                        <Link
                                            key={f.id}
                                            to={`/movies/${slugifyTitle(f.title)}`}
                                            state={{ id: f.id }}
                                            className="group block"
                                            title={`${f.title}${year ? ` (${year})` : ''}`}
                                        >
                                            <div className="aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40">
                                                <img src={poster} alt={f.title} referrerPolicy="no-referrer" className="h-full w-full object-cover group-hover:opacity-90 transition" />
                                            </div>
                                            <div className="mt-1 text-xs text-zinc-200 line-clamp-2">
                                                {f.title} {year ? <span className="text-zinc-400">({year})</span> : null}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* OMDB results (posters and titles) */}
                    <div className="w-full mt-6">
                        <h2 className="text-xl font-bold mb-3">Related Posters</h2>
                        {omdbResults.length === 0 ? (
                            <div className="text-sm text-zinc-400">No related posters found.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {omdbResults.map((item) => (
                                    <a
                                        key={item.imdbID}
                                        href={`https://www.imdb.com/title/${item.imdbID}/`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="group block"
                                        title={`${item.Title}${item.Year ? ` (${item.Year})` : ''}`}
                                    >
                                        <div className="aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40">
                                            <img src={item.Poster} alt={item.Title} referrerPolicy="no-referrer" className="h-full w-full object-cover group-hover:opacity-90 transition" />
                                        </div>
                                        <div className="mt-1 text-xs text-zinc-200 line-clamp-2">
                                            {item.Title} {item.Year ? <span className="text-zinc-400">({item.Year})</span> : null}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CharacterPage;

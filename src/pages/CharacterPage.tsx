import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { slugifyTitle } from '../lib/slug';
import { fetchCharacterImageUrl, fetchPosterUrl } from '../lib/omdb';
import { useSlugMap } from '../lib/slugMap';

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
            filmConnection(first: 20) {
                films { id title releaseDate }
                edges { node { id title releaseDate } }
                totalCount
            }
        }
    }
`;

const CharacterPage = () => {
    const { slug } = useParams();
    const location = useLocation();
    const { peopleSlugToId, ready } = useSlugMap();
    const passedId = (location.state as { id?: string } | null)?.id;
    const idFromMap = slug ? peopleSlugToId[slug] : undefined;
    const resolvedId = passedId || idFromMap;

    const { data, loading, error } = useQuery<{ person: any }>(CHARACTER_QUERY, {
        skip: !resolvedId,
        variables: { id: resolvedId },
    });

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const FALLBACK_IMAGE = 'https://placehold.co/300x450?text=No+Image';

    useEffect(() => {
        let cancelled = false;
        async function run() {
            const name = data?.person?.name;
            if (!name) { return; }
            // Try character-specific search first
            let url = await fetchCharacterImageUrl(name);
            // Fallback: if no character image found, try first film's poster
            if (!url) {
                const filmsFromFilms = data?.person?.filmConnection?.films ?? [];
                const filmsFromEdges = (data?.person?.filmConnection?.edges ?? []).map((e: any) => e?.node).filter(Boolean);
                const films: any[] = (filmsFromFilms?.length ? filmsFromFilms : filmsFromEdges) ?? [];
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
    }, [data?.person?.name]);

    if (loading || (!passedId && !ready)) return <p>{LOADING_MESSAGE}</p>;
    if (error) return <p>{ERROR_MESSAGE}</p>;

    const person = data?.person;
    if (!person) {
        return (
            <div className="max-w-[800px] mx-auto px-4">
                <Link className="text-yellow-400" to="/">{BACK}</Link>
                <h1 className="text-2xl font-bold mb-2">{NOT_FOUND_TITLE}</h1>
                <p className="mb-4">{NOT_FOUND_BODY}</p>
            </div>
        );
    }

    const filmsFromFilms = person.filmConnection?.films ?? [];
    const filmsFromEdges = (person.filmConnection?.edges ?? [])
        .map((e: any) => e?.node)
        .filter(Boolean);
    const films = filmsFromFilms.length ? filmsFromFilms : filmsFromEdges;

    return (
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6">
            <Link className="text-yellow-400 hover:text-yellow-300 transition-colors" to="/">{BACK}</Link>

            <section className="mt-4 rounded-2xl ring-1 ring-yellow-900/25 bg-gradient-to-b from-zinc-900/70 to-black/60 shadow-xl shadow-black/30 p-5 md:p-8">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">{person.name}</h1>

                    {/* Image */}
                    <div className="w-[200px] max-w-full aspect-[2/3] overflow-hidden rounded-lg ring-1 ring-zinc-800 bg-zinc-900/40">
                        <img src={imageUrl || FALLBACK_IMAGE} alt={person.name} className="h-full w-full object-cover" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap justify-center gap-2 text-sm text-zinc-300">
                        {person.species && (
                            <span className="inline-flex items-center rounded-md ring-1 ring-zinc-800 bg-zinc-900/30 px-2 py-1">
                                {LABEL_SPECIES}: {person.species.name}
                            </span>
                        )}
                        {person.homeworld && (
                            <span className="inline-flex items-center rounded-md ring-1 ring-zinc-800 bg-zinc-900/30 px-2 py-1">
                                {LABEL_HOMEWORLD}: {person.homeworld.name}
                            </span>
                        )}
                    </div>

                    {/* Info cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-base">
                        {person.birthYear && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_BIRTH_YEAR}</div>
                                <div className="text-zinc-100 mt-1">{person.birthYear}</div>
                            </div>
                        )}
                        {person.gender && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_GENDER}</div>
                                <div className="text-zinc-100 mt-1">{person.gender}</div>
                            </div>
                        )}
                        {person.height && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_HEIGHT}</div>
                                <div className="text-zinc-100 mt-1">{person.height} cm</div>
                            </div>
                        )}
                        {person.mass && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_MASS}</div>
                                <div className="text-zinc-100 mt-1">{person.mass} kg</div>
                            </div>
                        )}
                        {person.eyeColor && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_EYE_COLOR}</div>
                                <div className="text-zinc-100 mt-1">{person.eyeColor}</div>
                            </div>
                        )}
                        {person.hairColor && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_HAIR_COLOR}</div>
                                <div className="text-zinc-100 mt-1">{person.hairColor}</div>
                            </div>
                        )}
                        {person.skinColor && (
                            <div className="rounded-lg ring-1 ring-zinc-800 p-3 bg-zinc-900/30">
                                <div className="uppercase tracking-widest text-[10px] text-zinc-400">{LABEL_SKIN_COLOR}</div>
                                <div className="text-zinc-100 mt-1">{person.skinColor}</div>
                            </div>
                        )}
                    </div>

                    {/* Films */}
                    <div className="w-full mt-4">
                        <h2 className="text-xl font-bold mb-3">{LABEL_FILMS}</h2>
                        <ul className="space-y-2">
                            {films.map((f: any) => (
                                <li key={f.id} className="rounded-md ring-1 ring-zinc-800 bg-zinc-900/30 p-3">
                                    <Link
                                        to={`/movies/${slugifyTitle(f.title)}`}
                                        state={{ id: f.id }}
                                        className="text-yellow-200 hover:text-yellow-100 font-medium"
                                    >
                                        {f.title}
                                    </Link>
                                    <div className="text-sm text-zinc-400">{f.releaseDate?.slice(0, 4)}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CharacterPage;

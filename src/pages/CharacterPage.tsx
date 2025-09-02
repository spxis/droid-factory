import { gql, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import type { OMDBSearchItem, FilmRef, Person } from '@/types';

import CharacterCard from '@/components/CharacterCard';
import { FALLBACK_POSTER, FALLBACK_CHARACTER_IMAGE } from '@/lib/constants';
import { fetchCharacterImageUrl, fetchCharacterSearchResults, fetchPosterUrl } from '@/lib/omdb';
import { slugifyTitle } from '@/lib/slug';
import { fetchWookieeCharacterImageUrl } from '@/lib/wookiee';

// Visual Guide disabled (site no longer reliable). Keeping helpers commented for future swap-in.
// const RAW_VG_BASE = (import.meta.env.VITE_SW_VISUAL_GUIDE_BASE as string | undefined) || 'https://starwars-visualguide.com/assets/img';
// function normalizeVGBase(base: string): string {
//     let b = base.trim();
//     b = b.replace(/\/+$/, '');
//     if (b.endsWith('/characters')) { b = b.replace(/\/characters$/, ''); }
//     return b;
// }
// const VISUAL_GUIDE_BASE = `${normalizeVGBase(RAW_VG_BASE)}/characters`;

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

const CharacterPage = () => {
  const { id } = useParams();
  const finalId = id;
  const { t } = useTranslation();

  // Debug: log the resolved ID param
  useEffect(() => {
    if (finalId) {
      console.log('[CharacterPage] finalId:', finalId);
    } else {
      console.log('[CharacterPage] No finalId resolved yet');
    }
  }, [finalId]);

  const { data, loading, error } = useQuery<{ person: Person }>(CHARACTER_QUERY, {
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
      console.log('[CharacterPage] films (edges):', data.person?.filmConnection?.edges?.map?.((e) => e?.node));
    }
  }, [data]);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [omdbResults, setOmdbResults] = useState<OMDBSearchItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const name = data?.person?.name;
      if (!name) { return; }

      async function tryUrl(candidate: string | null, source: string): Promise<string | null> {
        if (!candidate) { return null; }

        const ok = await checkImage(candidate);
        console.log('[CharacterPage] image check', { source, ok, url: candidate });

        return ok ? candidate : null;
      }

      let chosen: string | null = null;

      // 1) Wookieepedia (Fandom) image via MediaWiki API
      const wookiee = await fetchWookieeCharacterImageUrl(name);
      chosen = await tryUrl(wookiee, 'wookieepedia');

      // 2) OMDB character image (preflight)
      if (!chosen) {
        const omdbUrl = await fetchCharacterImageUrl(name);
        chosen = await tryUrl(omdbUrl, 'omdb-character');
      }

      // 3) Fallback: first film's poster (preflight)
      if (!chosen) {
        const filmsFromFilms = (data?.person?.filmConnection?.films ?? []) as Array<{ id: string; title: string; releaseDate?: string }>;
        const filmsFromEdges = ((data?.person?.filmConnection?.edges ?? []) as Array<{ node?: { id: string; title: string; releaseDate?: string } }>)
          .map((e) => e?.node)
          .filter(Boolean) as Array<{ id: string; title: string; releaseDate?: string }>;
        const films = filmsFromFilms.length ? filmsFromFilms : filmsFromEdges;

        if (films.length) {
          const sorted = [...films].sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || ''));
          const first = sorted[0];

          if (first?.title && first?.releaseDate) {
            const poster = await fetchPosterUrl(first.title, first.releaseDate.slice(0, 4));
            chosen = await tryUrl(poster, 'omdb-film-poster');
          }
        }
      }

      if (!cancelled) {
        const finalUrl = chosen || FALLBACK_CHARACTER_IMAGE;

        if (!chosen) {
          console.log('[CharacterPage] image: using fallback image');
        } else {
          console.log('[CharacterPage] image: using', finalUrl);
        }

        setImageUrl(finalUrl);
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
  const person: Person | undefined = data?.person;
  const filmsFromFilms = (person?.filmConnection?.films ?? []) as FilmRef[];
  const filmsFromEdges = ((person?.filmConnection?.edges ?? []) as Array<{ node?: FilmRef }>)
    .map((e) => e?.node as FilmRef | undefined)
    .filter(Boolean) as FilmRef[];
  let filmsMerged: FilmRef[] = filmsFromFilms.length ? filmsFromFilms : filmsFromEdges;

  // Fallback: if still empty, compute films by scanning all films where this character appears
  if (filmsMerged.length === 0 && allFilmsData?.allFilms?.films?.length && person?.id) {
    const personId = person.id as string;
    const viaAllFilms = allFilmsData.allFilms.films
      .filter((f) => (f.characterConnection?.characters ?? []).some((ch) => ch?.id === personId))
      .map((f) => ({ id: f.id, title: f.title, releaseDate: f.releaseDate }));

    if (viaAllFilms.length) {
      console.log('[CharacterPage] using fallback via allFilms; matched', viaAllFilms.length, 'films');
    }
    filmsMerged = viaAllFilms as FilmRef[];
  }

  // Dedupe by id and sort by release year asc
  const filmMap = new Map<string, FilmRef>();
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
          let finalUrl = url || null;
          if (finalUrl) {
            const ok = await checkImage(finalUrl);
            if (!ok) {
              console.log('[CharacterPage] film poster 404, falling back', { title: f.title, year, url: finalUrl });
              finalUrl = null;
            }
          }
          return [f.id, finalUrl || FALLBACK_POSTER] as const;
        })
      );
      if (cancelled) { return; }
      setFilmPosters((prev) => {
        const next = { ...prev } as Record<string, string>;
        for (const [id, url] of entries) { next[id] = url; }
        return next;
      });
    }

    run();
    return () => { cancelled = true; };
  }, [films, filmPosters]);

  if (loading) { return <p>{t('character.loading')}</p>; }

  if (error) {
    console.error('[CharacterPage] error:', error);
    return <p>{t('character.error')}</p>;
  }

  if (!person) {
    return (
      <div className="max-w-[800px] mx-auto px-4">
        <Link className="text-yellow-400" to="/">{t('character.back', '← Back')}</Link>
        <h1 className="text-2xl font-bold mb-2">{t('character.notFoundTitle', 'Not Found')}</h1>
        <p className="mb-4">{t('character.notFoundBody', "We couldn't find that character.")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6">
      <Link className="text-yellow-400 hover:text-yellow-300 transition-colors" to="/">{t('character.back', '← Back')}</Link>

      <section className="mt-4 rounded-2xl ring-1 ring-yellow-900/25 bg-gradient-to-b from-zinc-900/70 to-black/60 shadow-xl shadow-black/30 p-5 md:p-8">
        <div className="flex flex-col items-center gap-4">
          <CharacterCard
            name={person.name}
            imageUrl={imageUrl}
            fallbackImage={FALLBACK_CHARACTER_IMAGE}
            labels={{
              species: t('character.labels.species'),
              homeworld: t('character.labels.homeworld'),
              birthYear: t('character.labels.birthYear'),
              gender: t('character.labels.gender'),
              height: t('character.labels.height'),
              mass: t('character.labels.mass'),
              eyeColor: t('character.labels.eyeColor'),
              hairColor: t('character.labels.hairColor'),
              skinColor: t('character.labels.skinColor'),
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
              {t('character.labels.films', 'Films')}
              <span className="ml-2 text-sm font-normal text-zinc-400">
                ({films.length})
              </span>
            </h2>
            {films.length === 0 ? (
              <div className="text-sm text-zinc-400">{t('character.noFilms', 'No films found.')}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {films.map((f: FilmRef) => {
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
            <h2 className="text-xl font-bold mb-3">{t('character.relatedPosters.heading', 'Related Posters')}</h2>
            {omdbResults.length === 0 ? (
              <div className="text-sm text-zinc-400">{t('character.relatedPosters.none', 'No related posters found.')}</div>
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

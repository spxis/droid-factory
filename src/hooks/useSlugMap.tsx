/* eslint-disable react-refresh/only-export-components */
import { gql, useQuery } from '@apollo/client';
import { createContext, useContext, useMemo } from 'react';
import type { SlugMapProviderProps } from '@/types';

import type { Film } from '@/types';

import { slugifyTitle } from '@/lib/slug';

const SLUG_MAP_QUERY = gql`
  query SlugMapData {
    allFilms {
      films { id title }
    }
    allPeople(first: 200) {
      people { id name }
    }
  }
`;

type SlugMap = {
  // Films
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
  // People
  peopleSlugToId: Record<string, string>;
  peopleIdToSlug: Record<string, string>;
  ready: boolean;
};

const SlugMapContext = createContext<SlugMap>({ slugToId: {}, idToSlug: {}, peopleSlugToId: {}, peopleIdToSlug: {}, ready: false });

const SlugMapProvider: React.FC<SlugMapProviderProps> = ({ children }) => {
  const { data, loading } = useQuery(SLUG_MAP_QUERY);

  const value: SlugMap = useMemo(() => {
    const films: Pick<Film, 'id' | 'title'>[] = data?.allFilms?.films ?? [];
    const people: { id: string; name: string }[] = data?.allPeople?.people ?? [];
    const slugToId: Record<string, string> = {};
    const idToSlug: Record<string, string> = {};
    const peopleSlugToId: Record<string, string> = {};
    const peopleIdToSlug: Record<string, string> = {};

    for (const f of films) {
      const slug = slugifyTitle(f.title);
      slugToId[slug] = f.id;
      idToSlug[f.id] = slug;
    }

    for (const p of people) {
      const slug = slugifyTitle(p.name);
      peopleSlugToId[slug] = p.id;
      peopleIdToSlug[p.id] = slug;
    }

    return { slugToId, idToSlug, peopleSlugToId, peopleIdToSlug, ready: !loading };
  }, [data, loading]);

  return <SlugMapContext.Provider value={value}>{children}</SlugMapContext.Provider>;
};

function useSlugMap(): SlugMap {
  return useContext(SlugMapContext);
}

export { SlugMapProvider, useSlugMap };
import { gql, useQuery } from '@apollo/client';
import { createContext, useContext, useMemo } from 'react';

import { slugifyTitle } from './slug';
import type { Film } from '../types';

const SLUG_MAP_QUERY = gql`
  query SlugMapData {
    allFilms {
      films { id title }
    }
    allPeople(first: 100) {
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

export const SlugMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data, loading } = useQuery(SLUG_MAP_QUERY);
    const films: Pick<Film, 'id' | 'title'>[] = data?.allFilms?.films ?? [];
    const people: { id: string; name: string }[] = data?.allPeople?.people ?? [];

    const value: SlugMap = useMemo(() => {
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
    }, [films, people, loading]);

    return <SlugMapContext.Provider value={value}>{children}</SlugMapContext.Provider>;
};

export function useSlugMap(): SlugMap {
    return useContext(SlugMapContext);
}

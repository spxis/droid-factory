import { useMemo } from "react";
import { Film, FilmsQueryResult } from "../types/film";
import { gql, useQuery } from '@apollo/client';

const FILMS_QUERY = gql`
    query Films {
        allFilms {
            films {
                id
                title
                episodeID
                releaseDate
            }
            edges { node { id title episodeID releaseDate } }
            totalCount
        }
    }
`;

const useFilms = () => {
    const { data, loading, error } = useQuery<FilmsQueryResult>(FILMS_QUERY);
    const films: Film[] = useMemo(() => {
        const byList = data?.allFilms?.films ?? [];
        const byEdges = (data?.allFilms?.edges ?? [])
            .map((e: { node?: Film }) => e?.node)
            .filter(Boolean) as Film[];
        const base = byList.length ? byList : byEdges;

        return [...base].sort((a, b) => (a.releaseDate || '').localeCompare(b.releaseDate || '')); // ascending by year
    }, [data]);

    return {
        films,
        totalCount: data?.allFilms?.totalCount ?? 0,
        loading,
        error,
    };
};

export { useFilms };
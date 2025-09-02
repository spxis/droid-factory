import { gql, useQuery } from '@apollo/client';
import { useMemo } from "react";

import { Film, FilmsQueryResult } from "@/types";

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
      .map((edge: { node?: Film }) => edge?.node)
      .filter(Boolean) as Film[];
    const base = byList.length ? byList : byEdges;

    return [...base].sort((left, right) => (left.releaseDate || '').localeCompare(right.releaseDate || '')); // ascending by year
  }, [data]);

  return {
    films,
    totalCount: data?.allFilms?.totalCount ?? 0,
    loading,
    error,
  };
};

export { useFilms };
import { gql, useQuery } from "@apollo/client";
import { useMemo } from "react";

import { useSlugMap } from "./useSlugMap";

import { FilmDetails } from "@/types";

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

const useFilmBySlug = (slug: string | undefined, passedId?: string) => {
  const { slugToId, ready } = useSlugMap();
  const resolvedId = useMemo(() => {
    return passedId || (slug ? slugToId[slug] : undefined);
  }, [passedId, slug, slugToId]);

  const { data, loading, error } = useQuery<{ film: FilmDetails }>(FILM_DETAIL_QUERY, {
    skip: !resolvedId,
    variables: { id: resolvedId },
  });

  return {
    film: data?.film || null,
    loading: loading || !ready,
    error
  };
}

export { useFilmBySlug };
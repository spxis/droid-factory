// Film domain model used across UI and queries
export interface Film {
  id: string;
  title: string;
  episodeID: number;
  releaseDate: string;
  // Optional fields used on detail page
  openingCrawl?: string;
  director?: string;
  producers?: string[];
}

// Query result shapes
export interface FilmsQueryResult {
  allFilms: {
  films?: Film[];
  edges?: { node: Film }[];
  totalCount?: number;
  };
}

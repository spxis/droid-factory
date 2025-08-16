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

// Minimal film reference used in person film connections
export interface FilmRef {
  id: string;
  title: string;
  releaseDate?: string;
}

// Query result shapes
export interface FilmsQueryResult {
  allFilms: {
  films?: Film[];
  edges?: { node: Film }[];
  totalCount?: number;
  };
}

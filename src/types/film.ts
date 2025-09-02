// Film domain model used across UI and queries
interface Film {
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
interface FilmRef {
  id: string;
  title: string;
  releaseDate?: string;
}

// Query result shapes
interface FilmsQueryResult {
  allFilms: {
  films?: Film[];
  edges?: { node: Film }[];
  totalCount?: number;
  };
}

export type { Film, FilmRef, FilmsQueryResult };

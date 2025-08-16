export interface Planet {
  id: string;
  name: string;
}

export interface Species {
  id: string;
  name: string;
}

export interface Character {
  id: string;
  name: string;
  species: Species | null;
  homeworld: Planet | null;
}

export interface FilmDetails {
  id: string;
  title: string;
  director: string;
  releaseDate: string;
  episodeID?: number;
  producers?: string[];
  openingCrawl?: string;
  characterConnection?: {
    characters: Character[];
  };
}

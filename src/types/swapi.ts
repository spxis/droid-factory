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

// Rich person shape used on the Character page
import type { FilmRef } from './film';

export interface Person {
  id: string;
  name: string;
  birthYear?: string | null;
  gender?: string | null;
  height?: string | null;
  mass?: string | null;
  eyeColor?: string | null;
  hairColor?: string | null;
  skinColor?: string | null;
  species?: Species | null;
  homeworld?: Planet | null;
  filmConnection?: {
    films?: FilmRef[];
    edges?: { node: FilmRef }[];
    totalCount?: number;
  };
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

// Shared UI/component prop types
import type { Film } from './film';
import type { FilmDetails, Character } from './swapi';

interface OpeningCrawlCardProps {
  crawl?: string | null;
}

interface TitleCardProps {
  title: string;
  episodeID?: number | null;
  releaseDate?: string | null;
  imdbRating?: string | null;
  genre?: string | null;
  runtime?: string | null;
  labels?: { episode?: string };
}

interface DetailsCardProps {
  film: Film | FilmDetails;
  labels?: {
    episode?: string;
    director?: string;
    producers?: string;
  };
  omdb?: {
    genre?: string | null;
    runtime?: string | null;
    imdbRating?: string | null;
    metascore?: string | null;
  } | null;
}

interface OmdbPlotCardProps {
  plot?: string | null;
  imdbID?: string | null;
}

interface CharactersCardProps {
  characters: Character[] | undefined | null;
}

interface PosterCardProps {
  src?: string | null;
  alt: string;
  fallbackSrc: string;
}

interface BadgeProps {
    label: string;
    value?: string | null;
}

interface FilmCardProps {
  film: Film;
  posterUrl: string;
}

interface CharacterCardProps {
  name: string;
  imageUrl: string | null;
  labels: {
    species: string;
    homeworld: string;
    birthYear: string;
    gender: string;
    height: string;
    mass: string;
    eyeColor: string;
    hairColor: string;
    skinColor: string;
  };
  speciesName?: string | null;
  homeworldName?: string | null;
  vitals: {
    birthYear?: string | null;
    gender?: string | null;
    height?: string | null;
    mass?: string | null;
    eyeColor?: string | null;
    hairColor?: string | null;
    skinColor?: string | null;
  };
  fallbackImage: string;
}

interface SlugMapProviderProps {
  children: React.ReactNode;
}

// Global slug maps for films and people
interface SlugMap {
  slugToId: Record<string, string>;
  idToSlug: Record<string, string>;
  peopleSlugToId: Record<string, string>;
  peopleIdToSlug: Record<string, string>;
  ready: boolean;
}

export type { BadgeProps, FilmCardProps, CharacterCardProps, OpeningCrawlCardProps, TitleCardProps, DetailsCardProps, OmdbPlotCardProps, CharactersCardProps, PosterCardProps, SlugMapProviderProps, SlugMap };
// Shared UI/component prop types
import type { Film } from './film';
import type { FilmDetails, Character } from './swapi';

export interface OpeningCrawlCardProps {
  crawl?: string | null;
}

export interface TitleCardProps {
  title: string;
  episodeID?: number | null;
  releaseDate?: string | null;
  imdbRating?: string | null;
  genre?: string | null;
  runtime?: string | null;
  labels?: { episode?: string };
}

export interface DetailsCardProps {
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

export interface OmdbPlotCardProps {
  plot?: string | null;
  imdbID?: string | null;
}

export interface CharactersCardProps {
  characters: Character[] | undefined | null;
}

export interface PosterCardProps {
  src?: string | null;
  alt: string;
  fallbackSrc: string;
}

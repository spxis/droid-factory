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

export type { BadgeProps, FilmCardProps, OpeningCrawlCardProps, TitleCardProps, DetailsCardProps, OmdbPlotCardProps, CharactersCardProps, PosterCardProps };
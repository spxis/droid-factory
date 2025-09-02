type OmdbLite = {
    plot?: string;
    metascore?: string;
    genre?: string;
    runtime?: string;
    imdbID?: string;
    imdbRating?: string;
};

interface OMDBSearchItem {
  Title: string;
  Year?: string;
  Poster?: string;
  imdbID: string;
  Type?: string;
}

interface OMDBMovieDetails {
  Title: string;
  Year?: string;
  Poster?: string;
  Plot?: string;
  Metascore?: string; // e.g. "90"
  Genre?: string;     // e.g. "Action, Adventure, Fantasy"
  Runtime?: string;   // e.g. "121 min"
  Rated?: string;     // e.g. "PG"
  Released?: string;  // e.g. "25 May 1977"
  imdbID: string;
  imdbRating?: string; // e.g. "8.6"
}

export type { OMDBSearchItem, OMDBMovieDetails, OmdbLite }
export interface Film {
  id: string;
  title: string;
  original_title: string;
  image: string;
  movie_banner: string;
  description: string;
  director: string;
  release_date: string;
  running_time: string;
  rt_score: string;
  /** Renseigné pour les films créés via le formulaire. */
  genres?: string[];
  language?: string;
}

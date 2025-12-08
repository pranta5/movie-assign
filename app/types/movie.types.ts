export interface MovieInterface {
  name: string;
  genre: string;
  language: string;
  duration: string;
  movieImage: string;
  cast: string[];
  director: string;
  releaseDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

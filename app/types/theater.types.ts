import { Types } from "mongoose";

export interface TheatreMovieInterface {
  movieId: Types.ObjectId;
  screenNumber: number;
  showTimings: string[];
  availableSeats: number;
}

export interface TheatreInterface {
  name: string;
  location: string;
  numberOfScreens: number;
  assignedMovies: TheatreMovieInterface[];
  createdAt?: Date;
  updatedAt?: Date;
}

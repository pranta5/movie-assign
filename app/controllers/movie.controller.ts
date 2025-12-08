import { StatusCode } from "../helper/StatusCode";
import { Request, Response } from "express";
import { MovieSchemaValidate } from "../models/movie.model";
import _ from "lodash";
import { movieRepositories } from "../repositories/movie.repositories";

class MovieHandler {
  // Create a movie
  async createMovie(req: Request, res: Response): Promise<any> {
    try {
      const {
        name,
        genre,
        language,
        duration,
        cast: rawCast,
        director,
        releaseDate,
      } = req.body;
      const poster = req.file?.path ?? "";

      // if cast sent as string (JSON array), try to parse it
      let cast = rawCast;
      if (typeof rawCast === "string") {
        try {
          cast = JSON.parse(rawCast);
        } catch (parseErr) {
          console.warn("Cast parse error:", parseErr);
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Invalid cast format. Must be a valid JSON array.",
          });
        }
      }

      const { error } = MovieSchemaValidate.validate({
        name,
        genre,
        language,
        duration,
        movieImage: poster,
        cast,
        director,
        releaseDate,
      });

      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const created = await movieRepositories.create({
        name,
        genre,
        language,
        duration,
        movieImage: poster,
        cast,
        director,
        releaseDate,
      });

      if (_.isObject(created) && !_.isEmpty(created)) {
        return res.status(StatusCode.CREATED).json({
          success: true,
          message: "Movie created successfully",
          data: created,
        });
      }

      return res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: "Invalid movie data",
      });
    } catch (err: any) {
      console.error("createMovie error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all movies (with theatres)
  async getAllMovies(req: Request, res: Response): Promise<any> {
    try {
      const list = await movieRepositories.findAllMoviesWithTheatres();

      if (_.isEmpty(list)) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "No movies found",
        });
      }

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Movies fetched successfully",
        data: list,
      });
    } catch (err: any) {
      console.error("getAllMovies error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while fetching movies",
      });
    }
  }

  // Get single movie by id
  async getMovieById(req: Request, res: Response): Promise<any> {
    try {
      const movieId = req.params.movieId;
      const doc = await movieRepositories.findById(movieId);

      if (_.isEmpty(doc)) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "Movie not found",
        });
      }

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Movie fetched successfully",
        data: doc,
      });
    } catch (err: any) {
      console.error("getMovieById error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while fetching movie by ID",
      });
    }
  }
}

export const movieController = new MovieHandler();

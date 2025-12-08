import { Types } from "mongoose";
import { MovieModel } from "../models/movie.model";

class MovieRepoAlt {
  // Insert a new movie document
  async create(movieData: any): Promise<any> {
    const doc = await MovieModel.create(movieData);
    return doc;
  }

  // Return movies along with theatres that show them and a theatre count
  async findAllMoviesWithTheatres() {
    const pipeline = [
      {
        $lookup: {
          from: "theatres",
          let: { movieId: "$_id" },
          pipeline: [
            { $unwind: "$assignedMovies" },
            {
              $match: {
                $expr: { $eq: ["$assignedMovies.movieId", "$$movieId"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                location: 1,
                "assignedMovies.showTimings": 1,
              },
            },
          ],
          as: "theatres",
        },
      },
      {
        $addFields: {
          totalTheatres: { $size: "$theatres" },
        },
      },
    ];

    const result = await MovieModel.aggregate(pipeline);
    return result;
  }

  // Find single movie by id and include theatres where it is assigned (with filtered assignedMovies)
  async findById(movieId: string): Promise<any | null> {
    if (!Types.ObjectId.isValid(movieId)) return null;

    const pipeline = [
      { $match: { _id: new Types.ObjectId(movieId) } },
      {
        $lookup: {
          from: "theatres",
          let: { movieIdObj: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$movieIdObj", "$assignedMovies.movieId"],
                },
              },
            },
            {
              $project: {
                name: 1,
                location: 1,
                numberOfScreens: 1,
                assignedMovies: {
                  $filter: {
                    input: "$assignedMovies",
                    as: "movie",
                    cond: { $eq: ["$$movie.movieId", "$$movieIdObj"] },
                  },
                },
              },
            },
          ],
          as: "theatres",
        },
      },
      {
        $addFields: { totalTheatres: { $size: "$theatres" } },
      },
      {
        $project: { __v: 0 },
      },
    ];

    const docs = await MovieModel.aggregate(pipeline);
    return docs[0] ?? null;
  }
}

const movieRepositories = new MovieRepoAlt();

export { movieRepositories };

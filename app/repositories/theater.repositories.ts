import { TheatreModel } from "../models/theater.model";

class TheatreRepoV2 {
  // Create a theatre document
  async create(payload: any): Promise<any> {
    const doc = await TheatreModel.create(payload);
    return doc;
  }

  // Retrieve all theatres with populated movie info inside assignedMovies
  async findAll(): Promise<any[]> {
    const pipeline = [
      {
        $lookup: {
          from: "movies",
          localField: "assignedMovies.movieId",
          foreignField: "_id",
          as: "movieDetails",
        },
      },
      {
        $addFields: {
          assignedMovies: {
            $map: {
              input: "$assignedMovies",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    movie: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$movieDetails",
                            as: "m",
                            cond: { $eq: ["$$m._id", "$$item.movieId"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $project: {
          movieDetails: 0,
          __v: 0,
        },
      },
    ];

    const theatres = await TheatreModel.aggregate(pipeline);
    return theatres;
  }

  // Add (append) assigned movies to a theatre
  async assignMovies(theaterId: string, assignedMovies: any[]): Promise<any> {
    const theatre = await TheatreModel.findById(theaterId);
    if (!theatre) {
      throw new Error("Theatre not found");
    }

    // append new assignments
    theatre.assignedMovies.push(...assignedMovies);
    await theatre.save();

    return theatre;
  }
}

const theatreRepositories = new TheatreRepoV2();

export { theatreRepositories };

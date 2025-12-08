import { Request, Response } from "express";
import { TheatreSchemaValidate } from "../models/theater.model";
import { StatusCode } from "../helper/StatusCode";
import { theatreRepositories } from "../repositories/theater.repositories";
import _ from "lodash";

class TheaterControllerV2 {
  // Create a theatre
  async createTheatre(req: Request, res: Response) {
    try {
      const { name, location, numberOfScreens, assignedMovies } = req.body;

      // support assignedMovies sent as JSON string
      let moviesPayload = assignedMovies;
      if (typeof assignedMovies === "string") {
        try {
          moviesPayload = JSON.parse(assignedMovies);
        } catch (parseErr) {
          console.warn(
            "createTheatre - assignedMovies parse failed:",
            parseErr
          );
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "Invalid format for assignedMovies. Must be valid JSON.",
          });
        }
      }

      const { error } = TheatreSchemaValidate.validate({
        name,
        location,
        numberOfScreens,
        assignedMovies: moviesPayload,
      });

      if (error) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const theatreDoc = await theatreRepositories.create({
        name,
        location,
        numberOfScreens,
        assignedMovies: moviesPayload || [],
      });

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Theatre created successfully",
        data: theatreDoc,
      });
    } catch (err: any) {
      console.error("createTheatre error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while creating theatre",
      });
    }
  }

  // Fetch all theatres
  async getAllTheatres(req: Request, res: Response) {
    try {
      const list = await theatreRepositories.findAll();

      if (_.isEmpty(list)) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "No theatres found",
        });
      }

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Theatres fetched successfully",
        data: list,
      });
    } catch (err: any) {
      console.error("getAllTheatres error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while fetching theatres",
      });
    }
  }

  // Assign movies to a theatre
  async assignMoviesToTheatre(req: Request, res: Response) {
    try {
      const { theaterId } = req.params;
      let { assignedMovies } = req.body;

      // normalize input (string -> parsed array)
      if (typeof assignedMovies === "string") {
        try {
          assignedMovies = JSON.parse(assignedMovies);
        } catch (parseErr) {
          console.warn("assignMoviesToTheatre - parse failed:", parseErr);
          return res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "assignedMovies must be a valid JSON array",
          });
        }
      }

      if (!Array.isArray(assignedMovies)) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "assignedMovies must be an array",
        });
      }

      const updated = await theatreRepositories.assignMovies(
        theaterId,
        assignedMovies
      );

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Movies assigned successfully",
        data: updated,
      });
    } catch (err: any) {
      console.error("assignMoviesToTheatre error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while assigning movies to theatre",
      });
    }
  }
}

export const theaterController = new TheaterControllerV2();

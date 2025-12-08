import express from "express";
import { verifyUser } from "../middleware/VerifyUser";
import { movieController } from "../controllers/movie.controller";
import ImageUpload from "../helper/ImageUpload";

const router = express.Router();

// Create a new movie
router.post(
  "/createmovie",
  verifyUser(["admin"]),
  ImageUpload.single("movieImage"),
  (req, res) => movieController.createMovie(req, res)
);

// Get all movies
router.get("/getmovies", verifyUser(["user", "admin"]), (req, res) =>
  movieController.getAllMovies(req, res)
);

// Get movie details by ID
router.get("/getmovie/:movieId", verifyUser(["user", "admin"]), (req, res) =>
  movieController.getMovieById(req, res)
);

export const movieRouter = router;

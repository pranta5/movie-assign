import express from "express";
import { verifyUser } from "../middleware/VerifyUser";
import { theaterController } from "../controllers/theater.controller";

const router = express.Router();

// Create theatre
router.post("/createtheater", verifyUser(["admin"]), (req, res) =>
  theaterController.createTheatre(req, res)
);

// Fetch all theatres
router.get("/gettheaters", verifyUser(["admin"]), (req, res) =>
  theaterController.getAllTheatres(req, res)
);

// Assign movies to a theatre
router.patch("/assignmovies/:theaterId", verifyUser(["admin"]), (req, res) =>
  theaterController.assignMoviesToTheatre(req, res)
);

export const theatreRouter = router;

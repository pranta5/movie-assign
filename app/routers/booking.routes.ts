import express from "express";
import { verifyUser } from "../middleware/VerifyUser";
import { bookingController } from "../controllers/booking.controller";

const router = express.Router();

// Create a booking
router.post("/book/:movieId/:theaterId", verifyUser(["user"]), (req, res) =>
  bookingController.createBooking(req, res)
);

// Cancel a booking
router.put("/cancel/:bookingId", verifyUser(["user"]), (req, res) =>
  bookingController.cancelBooking(req, res)
);

// Fetch movies with total bookings count
router.get("/movies/totalbookings", verifyUser(["admin"]), (req, res) =>
  bookingController.getMoviesWithTotalBookings(req, res)
);

// Fetch bookings grouped by theatre
router.get("/theatre/:theaterId/bookings", verifyUser(["admin"]), (req, res) =>
  bookingController.getBookingsBytheaterId(req, res)
);

// User booking history
router.get("/history", verifyUser(["user"]), (req, res) =>
  bookingController.viewBookingHistory(req, res)
);

export const bookingRouter = router;

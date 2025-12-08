import { Request, Response } from "express";
import { StatusCode } from "../helper/StatusCode";
import { bookingRepository } from "../repositories/booking.repositories";
import { Types } from "mongoose";

class BookingHandler {
  // Create a new booking
  async createBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { movieId, theaterId } = req.params;
      const { showTiming, numberOfTickets } = req.body;

      if (!userId || !movieId || !theaterId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Missing required IDs (userId, theaterId, or movieId)",
        });
      }

      if (!showTiming || !numberOfTickets) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "showTiming and numberOfTickets are required",
        });
      }

      const payload = {
        userId: new Types.ObjectId(userId),
        movieId: new Types.ObjectId(movieId),
        theaterId: new Types.ObjectId(theaterId),
        showTiming,
        numberOfTickets,
      } as any;

      const created = await bookingRepository.createBooking(payload);

      return res.status(StatusCode.CREATED).json({
        success: true,
        message: "Booking created successfully",
        data: created,
      });
    } catch (err: any) {
      console.error("createBooking error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while creating booking",
      });
    }
  }

  // Cancel an existing booking
  async cancelBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { bookingId } = req.params;

      if (!userId || !bookingId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Missing required userId or bookingId",
        });
      }

      const cancelled = await bookingRepository.cancelBooking(
        bookingId,
        userId
      );

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Booking cancelled successfully",
        data: cancelled,
      });
    } catch (err: any) {
      console.error("cancelBooking failed:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: err.message || "Failed to cancel booking",
      });
    }
  }

  // List movies along with total bookings
  async getMoviesWithTotalBookings(req: Request, res: Response) {
    try {
      const list = await bookingRepository.getMoviesWithTotalBookings();

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Fetched movies with total bookings successfully",
        data: list,
      });
    } catch (err: any) {
      console.error("getMoviesWithTotalBookings error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message:
          err.message || "Internal Server Error while fetching total bookings",
      });
    }
  }

  // Get bookings for a specific theatre
  async getBookingsBytheaterId(req: Request, res: Response) {
    try {
      const { theaterId } = req.params;

      if (!theaterId) {
        return res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "theaterId is required",
        });
      }

      const bookings = await bookingRepository.getBookingsBytheaterId(
        theaterId
      );

      if (!bookings || bookings.length === 0) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "No bookings found for this theatre",
        });
      }

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Fetched all bookings for the theatre successfully",
        data: bookings,
      });
    } catch (err: any) {
      console.error("getBookingsBytheaterId error:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: err.message || "Failed to fetch bookings by theaterId",
      });
    }
  }

  // View current user's booking history
  async viewBookingHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(StatusCode.UNAUTHORIZED).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const history = await bookingRepository.getUserBookingHistory(userId);

      if (!history || history.length === 0) {
        return res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: "No booking history found for this user",
        });
      }

      return res.status(StatusCode.OK).json({
        success: true,
        message: "Booking history fetched successfully",
        data: history,
      });
    } catch (err: any) {
      console.error("viewBookingHistory failed:", err);
      return res.status(StatusCode.SERVER_ERROR).json({
        success: false,
        message: "Internal server error while fetching booking history",
      });
    }
  }
}

export const bookingController = new BookingHandler();

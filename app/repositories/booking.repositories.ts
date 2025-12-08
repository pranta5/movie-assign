import { Types } from "mongoose";
import { BookingInterface } from "../types/booking.types";
import { BookingModel } from "../models/booking.model";
import { TheatreModel } from "../models/theater.model";

class BookingRepoV2 {
  // Create a booking (decrement available seats on theatre)
  async createBooking(data: BookingInterface): Promise<BookingInterface> {
    const { userId, theaterId, movieId, showTiming, numberOfTickets } = data;

    // validate object ids
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(theaterId) ||
      !Types.ObjectId.isValid(movieId)
    ) {
      throw new Error("Invalid IDs provided");
    }

    // find theatre and ensure movie + timing exist
    const theatre = await TheatreModel.findById(theaterId);
    if (!theatre) throw new Error("Theatre not found");

    const movieSlot = theatre.assignedMovies.find((m: any) => {
      return (
        m.movieId.toString() === movieId.toString() &&
        Array.isArray(m.showTimings) &&
        m.showTimings.includes(showTiming)
      );
    });

    if (!movieSlot) {
      throw new Error(
        "This movie is not assigned to this theatre for the selected timing"
      );
    }

    // check seats
    if (movieSlot.availableSeats < numberOfTickets) {
      throw new Error("Not enough seats available");
    }

    // compute amount (fixed price)
    const PRICE_PER_TICKET = 250;
    const totalAmount = PRICE_PER_TICKET * numberOfTickets;

    // create booking
    const booking = await BookingModel.create({
      userId,
      theaterId,
      movieId,
      showTiming,
      numberOfTickets,
      totalAmount,
      status: "booked",
    });

    // update theatre seat count
    movieSlot.availableSeats -= numberOfTickets;
    await theatre.save();

    return booking;
  }

  // Cancel a booking (restore seats)
  async cancelBooking(bookingId: string, userId: string): Promise<any> {
    // validate ids
    if (!Types.ObjectId.isValid(bookingId) || !Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid bookingId or userId");
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    // ownership check
    if (booking.userId.toString() !== userId.toString()) {
      throw new Error("You are not authorized to cancel this booking");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    const theatre = await TheatreModel.findById(booking.theaterId);
    if (!theatre) throw new Error("Theatre not found");

    const movieSlot = theatre.assignedMovies.find(
      (m: any) =>
        m.movieId.toString() === booking.movieId.toString() &&
        Array.isArray(m.showTimings) &&
        m.showTimings.includes(booking.showTiming)
    );

    if (movieSlot) {
      movieSlot.availableSeats += booking.numberOfTickets;
      await theatre.save();
    }

    booking.status = "cancelled";
    await booking.save();

    return booking;
  }

  // Get movies aggregated with total booked tickets
  async getMoviesWithTotalBookings(): Promise<any[]> {
    const agg = await BookingModel.aggregate([
      { $match: { status: "booked" } },
      {
        $group: {
          _id: "$movieId",
          totalTicketsBooked: { $sum: "$numberOfTickets" },
        },
      },
      {
        $lookup: {
          from: "movies",
          localField: "_id",
          foreignField: "_id",
          as: "movieDetails",
        },
      },
      { $unwind: "$movieDetails" },
      {
        $project: {
          _id: 0,
          movieId: "$_id",
          name: "$movieDetails.name",
          genre: "$movieDetails.genre",
          language: "$movieDetails.language",
          totalTicketsBooked: 1,
        },
      },
      { $sort: { totalTicketsBooked: -1 } },
    ]);

    return agg;
  }

  // Get bookings grouped by movie+timing for a theatre
  async getBookingsBytheaterId(theaterId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(theaterId)) {
      throw new Error("Invalid theaterId format");
    }

    const agg = await BookingModel.aggregate([
      {
        $match: {
          theaterId: new Types.ObjectId(theaterId),
          status: "booked",
        },
      },
      {
        $group: {
          _id: {
            movieId: "$movieId",
            showTiming: "$showTiming",
          },
          totalTicketsBooked: { $sum: "$numberOfTickets" },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $lookup: {
          from: "movies",
          localField: "_id.movieId",
          foreignField: "_id",
          as: "movieDetails",
        },
      },
      { $unwind: "$movieDetails" },
      {
        $project: {
          _id: 0,
          movieId: "$_id.movieId",
          movieName: "$movieDetails.name",
          genre: "$movieDetails.genre",
          showTiming: "$_id.showTiming",
          totalTicketsBooked: 1,
          totalRevenue: 1,
        },
      },
      { $sort: { movieName: 1, showTiming: 1 } },
    ]);

    return agg;
  }

  // Get booking history for a user (latest first)
  async getUserBookingHistory(userId: string) {
    try {
      const userObjId = new Types.ObjectId(userId);

      const history = await BookingModel.aggregate([
        { $match: { userId: userObjId } },
        {
          $lookup: {
            from: "movies",
            localField: "movieId",
            foreignField: "_id",
            as: "movieDetails",
          },
        },
        {
          $lookup: {
            from: "theatres",
            localField: "theaterId",
            foreignField: "_id",
            as: "theatreDetails",
          },
        },
        { $unwind: "$movieDetails" },
        { $unwind: "$theatreDetails" },
        {
          $project: {
            _id: 1,
            showTiming: 1,
            numberOfTickets: 1,
            totalAmount: 1,
            status: 1,
            createdAt: 1,
            "movieDetails.name": 1,
            "movieDetails.genre": 1,
            "movieDetails.language": 1,
            "movieDetails.duration": 1,
            "theatreDetails.name": 1,
            "theatreDetails.location": 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      return history;
    } catch (err: any) {
      console.error("Error fetching booking history:", err);
      throw err;
    }
  }
}

const bookingRepository = new BookingRepoV2();

export { bookingRepository };

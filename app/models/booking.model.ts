import { model, Schema, Types } from "mongoose";
import Joi from "joi";
import { BookingInterface } from "../types/booking.types";

/**
 * Helper to validate that a string is a valid Mongo ObjectId
 */
const validateObjectId = (value: string, helpers: Joi.CustomHelpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const BookingSchemaValidate = Joi.object({
  userId: Joi.string().required().custom(validateObjectId),

  movieId: Joi.string().required().custom(validateObjectId),

  theaterId: Joi.string().required().custom(validateObjectId),

  showTiming: Joi.string()
    .required()
    .pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i),
  numberOfTickets: Joi.number().integer().min(1).required(),

  totalAmount: Joi.number().min(0).required(),

  status: Joi.string().valid("booked", "cancelled").default("booked"),
});

/**
 * Mongoose schema & model for bookings
 */
const BookingSchema = new Schema<BookingInterface>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    theaterId: { type: Schema.Types.ObjectId, ref: "Theater", required: true },
    showTiming: { type: String, required: true },
    numberOfTickets: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const BookingModel = model<BookingInterface>("Booking", BookingSchema);

export { BookingModel };

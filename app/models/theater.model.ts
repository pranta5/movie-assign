import { model, Schema, Types } from "mongoose";
import Joi from "joi";
import { TheatreInterface } from "../types/theater.types";

export const TheatreSchemaValidate = Joi.object({
  name: Joi.string().trim().required().min(3),

  location: Joi.string().trim().required(),

  numberOfScreens: Joi.number().integer().min(1).required(),

  assignedMovies: Joi.array()
    .items(
      Joi.object({
        movieId: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
              return helpers.error("any.invalid");
            }
            return value;
          }),

        screenNumber: Joi.number().integer().required(),

        showTimings: Joi.array()
          .items(
            Joi.string().pattern(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
          )
          .min(1)
          .required(),

        totalSeats: Joi.number().integer().min(1).default(100),

        availableSeats: Joi.number().integer().min(0).default(100),
      })
    )
    .optional(),
});

const TheatreSchema = new Schema<TheatreInterface>(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    numberOfScreens: { type: Number, required: true },

    assignedMovies: [
      {
        movieId: { type: Schema.Types.ObjectId, ref: "Movie" },
        screenNumber: { type: Number },
        showTimings: [{ type: String }],
        totalSeats: { type: Number, default: 100 },
        availableSeats: { type: Number, default: 100 },
      },
    ],
  },
  { timestamps: true }
);

const TheatreModel = model<TheatreInterface>("Theatre", TheatreSchema);

export { TheatreModel };

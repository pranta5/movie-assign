import { model, Schema, Types } from "mongoose";
import Joi from "joi";
import { MovieInterface } from "../types/movie.types";

// ---------------------------------------
// Movie Validation Schema (Joi)
// ---------------------------------------
export const MovieSchemaValidate = Joi.object({
  name: Joi.string().trim().required().min(3),

  genre: Joi.string().required(),

  language: Joi.string().required(),

  duration: Joi.string()
    .required()
    .pattern(/^[0-9]+h\s?[0-9]*m?$/),
  movieImage: Joi.string().required(),

  cast: Joi.array().items(Joi.string().trim().min(2)).required().min(1),
  director: Joi.string().trim().required(),

  releaseDate: Joi.date().required(),
});

// ---------------------------------------
// Mongoose Schema
// ---------------------------------------
const MovieSchema = new Schema<MovieInterface>(
  {
    name: { type: String, required: true, trim: true },
    genre: { type: String, required: true },
    language: { type: String, required: true },
    duration: { type: String, required: true },
    movieImage: { type: String, required: true },
    cast: [{ type: String }],
    director: { type: String, required: true },
    releaseDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const MovieModel = model<MovieInterface>("Movie", MovieSchema);

export { MovieModel };

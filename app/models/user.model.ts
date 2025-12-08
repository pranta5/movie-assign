import { model, Schema, Types } from "mongoose";
import Joi from "joi";
import { UserInterface } from "../types/user.types";

//validation schema
export const UserSchemaValidate = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().required().email(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
  password: Joi.string().required().min(6),
  role: Joi.string().valid("user", "admin").default("user"),
  isVerified: Joi.boolean().default(false),
});

const UserSchema = new Schema<UserInterface>(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserModel = model<UserInterface>("User", UserSchema);

export { UserModel };

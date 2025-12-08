import { model, Schema } from "mongoose";
import Joi from "joi";
import { RoleInterface } from "../types/role.types";

// ---------------------------------------
// Joi Validation Schema
// ---------------------------------------
export const RoleSchemaValidate = Joi.object({
  name: Joi.string().trim().min(3).required(),
});

// ---------------------------------------
// Mongoose Schema
// ---------------------------------------
const RoleSchema = new Schema<RoleInterface>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const RoleModel = model<RoleInterface>("Role", RoleSchema);

export { RoleModel };

import { Schema, model } from "mongoose";
import { ShootStatus } from "../types/index";
import type { ShootDoc } from "../types/index";

// A numeric enum is a two-way phone book at runtime; keep only the numbers
const statusValues = Object.values(ShootStatus).filter(
  (v): v is ShootStatus => typeof v === "number",
);

const shootSchema = new Schema<ShootDoc>({
  // Owner: the _id of a User. ref says which collection it points to.
  clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  photographerId: { type: Schema.Types.ObjectId, ref: "User" },

  // Rule 1: required
  type: { type: String, required: [true, "type is required"], trim: true },
  location: { type: String, required: [true, "location is required"], trim: true },
  scheduledDate: { type: Date, required: [true, "scheduledDate is required"] },

  // Rule 2: enum (only 0, 1, 2 or 3)
  status: {
    type: Number,
    enum: { values: statusValues, message: "status must be 0, 1, 2 or 3" },
    default: ShootStatus.Requested,
  },

  // Rule 3: min/max
  price: {
    type: Number,
    min: [0, "price cannot be negative"],
    max: [1000000, "price is too high"],
  },
});

// _id becomes id, because the frontend has always read .id
shootSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Shoot = model<ShootDoc>("Shoot", shootSchema);
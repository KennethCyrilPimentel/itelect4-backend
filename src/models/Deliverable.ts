import { Schema, model } from "mongoose";
import type { DeliverableDoc, DeliverableStatus } from "../types/index";

const statusValues: DeliverableStatus[] = ["raw", "editing", "delivered"];

const deliverableSchema = new Schema<DeliverableDoc>({
  // Which shoot this batch belongs to
  shootId: { type: Schema.Types.ObjectId, ref: "Shoot", required: true },

  // Owner, copied from the shoot on create. Same job as clientId on Shoot:
  // every route filters by it, so nobody sees someone else's deliverables.
  clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // Rule 1: required
  batchName: {
    type: String,
    required: [true, "batchName is required"],
    trim: true,
  },

  // Rule 2: enum (only these three words)
  status: {
    type: String,
    enum: {
      values: statusValues,
      message: "status must be raw, editing or delivered",
    },
    default: "raw",
  },

  // Rule 3: min/max
  fileCount: {
    type: Number,
    required: [true, "fileCount is required"],
    min: [0, "fileCount cannot be negative"],
    max: [100000, "fileCount is too high"],
  },

  // Optional: only set once the batch is delivered
  deliveredAt: { type: Date },
});

// _id becomes id, because the frontend has always read .id
deliverableSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Deliverable = model<DeliverableDoc>(
  "Deliverable",
  deliverableSchema,
);
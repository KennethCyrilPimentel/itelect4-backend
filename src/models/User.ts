import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserDoc } from "../types/index";

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["client", "photographer", "admin"],
      default: "client",
    },
    isActive: { type: Boolean, default: true },
    // select: false = hidden from queries unless you ask with .select("+password")
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true },
);

// Runs before every save: swaps the plain password for its hash
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// _id becomes id, and the password never leaves the server
userSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const User = model<UserDoc>("User", userSchema);
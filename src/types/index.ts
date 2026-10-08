import type { Types } from "mongoose";

// Copied from itelect4-project, same values so the frontend keeps working
export enum ShootStatus {
  Requested,
  Confirmed,
  Completed,
  Cancelled,
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "client" | "photographer" | "admin";
  isActive: boolean;
}

export interface Shoot {
  id: number;
  clientId: number;
  photographerId?: number; // optional: the Request Shoot form doesn't pick one
  type: string;
  status: ShootStatus;
  scheduledDate: Date;
  location: string;
  price?: number;
}

// What the database stores: ids become ObjectIds
export type UserDoc = Omit<User, "id"> & {
  password: string;
};

export type ShootDoc = Omit<Shoot, "id" | "clientId" | "photographerId"> & {
  clientId: Types.ObjectId;
  photographerId?: Types.ObjectId;
};

// What the client sends. No id, no clientId: the server reads the owner off the token.
export type NewShootBody = Pick<Shoot, "type" | "location" | "scheduledDate">;
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

// NEW: copied from itelect4-project, same values so the frontend keeps working
export type DeliverableStatus = "raw" | "editing" | "delivered";

export interface Deliverable {
  id: number;
  shootId: number;
  batchName: string;
  status: DeliverableStatus;
  fileCount: number;
  deliveredAt?: Date; // optional: only set once delivered
}

// What the database stores: ids become ObjectIds
export type UserDoc = Omit<User, "id"> & {
  password: string;
};

export type ShootDoc = Omit<Shoot, "id" | "clientId" | "photographerId"> & {
  clientId: Types.ObjectId;
  photographerId?: Types.ObjectId;
};

// NEW: shootId points at a Shoot. clientId is the owner, copied from that
// shoot when the deliverable is created, so routes can scope by owner.
export type DeliverableDoc = Omit<Deliverable, "id" | "shootId"> & {
  shootId: Types.ObjectId;
  clientId: Types.ObjectId;
};

// What the client sends. No id, no clientId: the server reads the owner off the token.
export type NewShootBody = Pick<Shoot, "type" | "location" | "scheduledDate">;

// NEW: shootId is a string here because that's how ids travel over the API.
// status is optional (the schema defaults it to "raw").
export type NewDeliverableBody = Pick<Deliverable, "batchName" | "fileCount"> &
  Partial<Pick<Deliverable, "status">> & {
    shootId: string;
  };
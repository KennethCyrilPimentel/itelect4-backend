import { Router, type Request, type Response } from "express";
import { Deliverable } from "../models/Deliverable";
import { Shoot } from "../models/Shoot";
import { requireAuth } from "../middleware/auth";
import type { NewDeliverableBody } from "../types/index";

export const deliverableRouter = Router();

// Same one line as shoots.ts: every route here needs a valid token
deliverableRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/deliverables              -> all of this user's deliverables
// GET /api/deliverables?shootId=abc  -> only the ones for ONE shoot
// (the frontend's fetchDeliverablesByShootId already asks this way)
deliverableRouter.get("/", async (req: Request, res: Response) => {
  // CHANGED: no type annotation, so TypeScript works out the types itself
  const filter =
    typeof req.query.shootId === "string"
      ? { clientId: req.userId, shootId: req.query.shootId }
      : { clientId: req.userId };

  const deliverables = await Deliverable.find(filter).sort({ _id: -1 });
  res.json(deliverables);
});

// GET /api/deliverables/:id -- right row AND right owner
deliverableRouter.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const deliverable = await Deliverable.findOne({
    _id: req.params.id,
    clientId: req.userId,
  });

  // 404, not 403: a 403 would confirm the deliverable exists
  if (!deliverable) {
    res.status(404).json({ message: "No deliverable with that id" });
    return;
  }

  res.json(deliverable);
});

// POST /api/deliverables
deliverableRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewDeliverableBody>,
    res: Response,
  ) => {
    const { shootId, batchName, fileCount, status } = req.body;

    // The shoot must exist AND be this user's, or anyone could attach
    // deliverables to somebody else's shoot
    const shoot = await Shoot.findOne({ _id: shootId, clientId: req.userId });
    if (!shoot) {
      res.status(404).json({ message: "No shoot with that id" });
      return;
    }

    const deliverable = await Deliverable.create({
      shootId: shoot._id,
      batchName,
      fileCount,
      status,
      // Delivered batches get a timestamp automatically
      deliveredAt: status === "delivered" ? new Date() : undefined,
      // The owner comes off the verified token, never from the body
      clientId: req.userId,
    });

    res.status(201).json(deliverable);
  },
);

// PATCH /api/deliverables/:id
deliverableRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewDeliverableBody>>,
    res: Response,
  ) => {
    const { batchName, fileCount, status } = req.body;

    // Only copy the fields a client may change (shootId and owner stay put)
    const update: {
      batchName?: string;
      fileCount?: number;
      status?: NewDeliverableBody["status"];
      deliveredAt?: Date;
    } = {};
    if (batchName !== undefined) update.batchName = batchName;
    if (fileCount !== undefined) update.fileCount = fileCount;
    if (status !== undefined) {
      update.status = status;
      if (status === "delivered") update.deliveredAt = new Date();
    }

    const deliverable = await Deliverable.findOneAndUpdate(
      { _id: req.params.id, clientId: req.userId },
      update,
      // new: return the row AFTER the change
      // runValidators: schema rules are skipped on updates otherwise
      { new: true, runValidators: true },
    );

    if (!deliverable) {
      res.status(404).json({ message: "No deliverable with that id" });
      return;
    }

    res.json(deliverable);
  },
);

// DELETE /api/deliverables/:id
deliverableRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const deliverable = await Deliverable.findOneAndDelete({
      _id: req.params.id,
      clientId: req.userId,
    });

    if (!deliverable) {
      res.status(404).json({ message: "No deliverable with that id" });
      return;
    }

    // 204 = done, and there is deliberately no body
    res.status(204).send();
  },
);
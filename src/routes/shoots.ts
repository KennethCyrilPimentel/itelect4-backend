import { Router, type Request, type Response } from "express";
import { Shoot } from "../models/Shoot";
import { requireAuth } from "../middleware/auth";
import type { NewShootBody } from "../types/index";

export const shootRouter = Router();

// One line: every route in this file now needs a valid token
shootRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/shoots -- only this user's shoots, newest date first
shootRouter.get("/", async (req: Request, res: Response) => {
  const shoots = await Shoot.find({ clientId: req.userId }).sort({
    scheduledDate: -1,
  });
  res.json(shoots);
});

// GET /api/shoots/:id -- right row AND right owner
shootRouter.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const shoot = await Shoot.findOne({
    _id: req.params.id,
    clientId: req.userId,
  });

  // 404, not 403: a 403 would confirm the shoot exists
  if (!shoot) {
    res.status(404).json({ message: "No shoot with that id" });
    return;
  }

  res.json(shoot);
});

// POST /api/shoots
shootRouter.post(
  "/",
  async (req: Request<unknown, unknown, NewShootBody>, res: Response) => {
    const { type, location, scheduledDate } = req.body;

    const shoot = await Shoot.create({
      type,
      location,
      scheduledDate,
      // The owner comes off the verified token, never from the body
      clientId: req.userId,
    });

    res.status(201).json(shoot);
  },
);

// PATCH /api/shoots/:id
shootRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewShootBody>>,
    res: Response,
  ) => {
    const { type, location, scheduledDate } = req.body;

    // Only copy the fields a client may change
    const update: Partial<NewShootBody> = {};
    if (type !== undefined) update.type = type;
    if (location !== undefined) update.location = location;
    if (scheduledDate !== undefined) update.scheduledDate = scheduledDate;

    const shoot = await Shoot.findOneAndUpdate(
      { _id: req.params.id, clientId: req.userId },
      update,
      // new: return the row AFTER the change
      // runValidators: schema rules are skipped on updates otherwise
      { new: true, runValidators: true },
    );

    if (!shoot) {
      res.status(404).json({ message: "No shoot with that id" });
      return;
    }

    res.json(shoot);
  },
);

// DELETE /api/shoots/:id
shootRouter.delete("/:id", async (req: Request<IdParam>, res: Response) => {
  const shoot = await Shoot.findOneAndDelete({
    _id: req.params.id,
    clientId: req.userId,
  });

  if (!shoot) {
    res.status(404).json({ message: "No shoot with that id" });
    return;
  }

  // 204 = done, and there is deliberately no body
  res.status(204).send();
});
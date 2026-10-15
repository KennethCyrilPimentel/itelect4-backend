import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db"; // NEW
import { authRouter } from "./routes/auth";
import { shootRouter } from "./routes/shoots";
import { deliverableRouter } from "./routes/deliverables";

// Builds the app and stops. It never opens a port by itself.
export const app = express();

// Lets your Vite frontend (a different port) call this API
app.use(cors());

// Reads JSON bodies onto req.body (without it, req.body is undefined)
app.use(express.json());

// NEW: wait for the database before ANY route runs.
// On your laptop, server.ts connected before listening. On Vercel there
// is no startup step: a request is the first thing that happens, so the
// waiting moves here. Like a shop that opens the door first and checks
// the fridge is on before serving the first customer.
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err); // goes to the error handler at the bottom
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/shoots", shootRouter);
app.use("/api/deliverables", deliverableRouter);

// Nothing matched: answer in JSON instead of Express's HTML page
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// Four parameters is what marks this as the error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
    return;
  }

  // A string in the URL that isn't a valid id
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: `"${err.value}" is not a valid id` });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

// NEW: Vercel looks for a default export of the Express app. This one
// line is the whole deployment config, which is why there's no vercel.json.
export default app;
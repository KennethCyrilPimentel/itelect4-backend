import mongoose from "mongoose";

// The promise of a connection, kept. The first caller starts the connect,
// and every caller after it gets this same promise back.
// Think of it like one shared phone line: the first person dials, and
// everyone else just waits on that same call instead of dialing again.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  // Fail with a clear sentence if .env is empty
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in.",
    );
  }

  if (connection === null) {
    // Without the timeout, a wrong URI hangs for ~30s before failing
    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((err: unknown) => {
        // A failed attempt must not be the thing we keep, or every later
        // request would fail with this same old error
        connection = null;
        throw err;
      });
  }

  return connection;
}
import dns from "node:dns"; // NEW
import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";

// NEW: local dev only. Makes Node resolve the Atlas address through
// Cloudflare/Google DNS instead of your network's, which is refusing the
// lookup. Vercel never runs this file, so the deploy is unaffected.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT = Number(process.env.PORT) || 4000;

// Still started here, so a wrong MONGODB_URI shows up in this terminal
// within 5 seconds. connectDB hands out one shared connection, so this is
// the same one the middleware in app.ts waits for.
connectDB().catch((err: unknown) => {
  // Logged, not exited: the app can still answer requests, and a failed
  // request will say what went wrong
  console.error("Could not connect to MongoDB:", err);
});

// Listen right away. The middleware in app.ts waits for the database now.
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
import "dotenv/config";
import dns from "node:dns";
import { app } from "./app";
import { connectDB } from "./config/db";

// Use public DNS for the Atlas lookup (some home networks block it)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = Number(process.env.PORT) || 4000;

// Connect FIRST, then listen, so no request arrives before the DB is ready
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch((err: unknown) => {
    console.error("Could not start:", err);
    process.exit(1);
  });
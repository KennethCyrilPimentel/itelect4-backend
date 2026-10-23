import "dotenv/config";
import { reviewProject } from "./ai/gemini";

// One real Gemini call from the terminal: no Express, no token, no DB.
async function tryAi() {
  const review = await reviewProject(
    "A 3-hour birthday party shoot for a 7-year-old, indoors at a " +
      "function hall, about 30 guests, I am the only photographer.",
  );
  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
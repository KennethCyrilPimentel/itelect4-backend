import { GoogleGenAI, type Content } from "@google/genai";
import { MODEL, SYSTEM_PROMPT, EXAMPLES, wrap } from "./prompt";
import {
  reviewSchema,
  reviewJsonSchema,
  type Review,
} from "../schemas/review";

// Made on first use, like connectDB. A missing key becomes a clear
// error on the first AI call instead of crashing the whole app.
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env, and to Vercel.",
    );
  }
  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

// Two examples become two finished exchanges (user turn, then model
// turn), and the real description is the last turn. Five turns total.
function buildContents(description: string): Content[] {
  const shots: Content[] = EXAMPLES.flatMap((example) => [
    { role: "user", parts: [{ text: wrap(example.description) }] },
    { role: "model", parts: [{ text: JSON.stringify(example.review) }] },
  ]);
  return [...shots, { role: "user", parts: [{ text: wrap(description) }] }];
}

// Thrown when Gemini answered but the answer is unusable.
// The route will turn this into a 502.
export class AiReplyError extends Error {}

export async function reviewProject(description: string): Promise<Review> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseJsonSchema: reviewJsonSchema,
      // No temperature on purpose: Google says leave it at 1.0 for Gemini 3.
    },
  });

  // Check 1: is there any text? (Blocked replies have none.)
  const text = response.text;
  if (!text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  // Check 2: is it JSON?
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  // Check 3: does it match our schema?
  const result = reviewSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the schema");
  }
  return result.data;
}
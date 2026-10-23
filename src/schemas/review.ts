import { z } from "zod";

// What a client may send to POST /api/ai. Checked BEFORE calling Gemini,
// so a bad request costs no quota.
export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe your shoot in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
});

// What Gemini must send BACK. One schema, three jobs:
// the TypeScript type, the JSON Schema sent to Gemini, and the check on the reply.
// .describe() text travels to Gemini and tells it what each field is for.
export const reviewSchema = z.object({
  summary: z
    .string()
    .describe("One sentence restating what the shoot is."),
  shotList: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Key shots the photographer should make sure to capture."),
  prepTips: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Concrete things to prepare or bring before the shoot day."),
  difficulty: z
    .enum(["easy", "moderate", "hard"])
    .describe("How demanding the shoot is, based on the description."),
});

export type Review = z.infer<typeof reviewSchema>;

// Computed once, when this file is first imported.
export const reviewJsonSchema = z.toJSONSchema(reviewSchema);
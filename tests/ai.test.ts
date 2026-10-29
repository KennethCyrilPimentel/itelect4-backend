import "dotenv/config";
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app";

// app.ts waits for connectDB() before every route, and there is no
// database on GitHub's machine. This swaps the whole db module for one
// whose connectDB does nothing, for this test file only. Everything else
// in app.ts (cors, requireAuth, the limiter) stays real.
vi.mock("../src/config/db", () => ({
  connectDB: async () => {},
}));

// A token made the way the login route makes one: same payload shape,
// signed with the same JWT_SECRET. No user has to exist, because
// requireAuth only checks the signature.
function tokenFor(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "5m" });
}

describe("POST /api/ai", () => {
  it("answers 401 when there is no token", async () => {
    const res = await request(app)
      .post("/api/ai")
      .send({ prompt: "A wedding shoot in Lipa City with two photographers." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe(
      "No token. Send Authorization: Bearer <token>",
    );
  });

  it("answers 401 when the token was signed with another secret", async () => {
    const forged = jwt.sign({ userId: "someone" }, "not-the-secret");

    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${forged}`)
      .send({ prompt: "A wedding shoot in Lipa City with two photographers." });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Token is invalid or has expired");
  });

  it("lets a valid token through, then checks the body", async () => {
    // "Too short" fails the request schema, so the route refuses it
    // before reviewProject() runs. Gemini is never called.
    const res = await request(app)
      .post("/api/ai")
      .set("Authorization", `Bearer ${tokenFor("test-user")}`)
      .send({ prompt: "Too short" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toHaveLength(1);
  });
});
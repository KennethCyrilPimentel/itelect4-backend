import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express doesn't know about our userId field, so we add it to its Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// What we put inside the token, and get back out when we verify it
export interface TokenPayload {
  userId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Clients send: Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return;
  }

  const token = header.slice("Bearer ".length);

  try {
    // Checks the signature (made with our secret) AND that it hasn't expired
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Token is invalid or has expired" });
  }
}
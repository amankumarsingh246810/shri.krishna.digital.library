import jwt from "jsonwebtoken";

export function generateToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from server/.env");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

export function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from server/.env");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
}


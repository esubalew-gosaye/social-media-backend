import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { logger } from "./logger.js"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

interface TokenPayload {
  userId: number
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    logger.error("Token verification failed", { error })
    throw new Error("Invalid token")
  }
}

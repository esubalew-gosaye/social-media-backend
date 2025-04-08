import type { PrismaClient } from "@prisma/client"
import { verifyToken } from "./utils/auth"
import { logger } from "./utils/logger"

// Use a more generic type for the request
interface RequestWithHeaders {
  headers: {
    authorization?: string
    [key: string]: string | undefined
  }
}

interface ContextParams {
  req: RequestWithHeaders
  prisma: PrismaClient
}

export interface Context {
  prisma: PrismaClient
  userId?: number
  userRole?: string
  isAuthenticated: boolean
}

export async function createContext({ req, prisma }: ContextParams): Promise<Context> {
  // Default context
  const context: Context = {
    prisma,
    isAuthenticated: false,
  }

  // Get the token from the request headers
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return context
  }

  try {
    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (decoded) {
      context.userId = decoded.userId
      context.userRole = decoded.role
      context.isAuthenticated = true

      logger.info(`Authenticated request from user ${decoded.userId} with role ${decoded.role}`)
    }
  } catch (error) {
    logger.warn("Invalid authentication token", { error })
  }

  return context
}

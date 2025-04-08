import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500

  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "developement" : err.stack,
  })
}


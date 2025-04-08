import fs from "fs"
import path from "path"
import { format } from "date-fns"

// Ensure log directory exists
const logDir = path.join(process.cwd(), "logs")
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const logFilePath = path.join(logDir, "log.txt")

// Log levels
type LogLevel = "info" | "warn" | "error" | "debug"

function formatLogMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss")
  const metaString = meta ? ` ${JSON.stringify(meta)}` : ""
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}\n`
}

function writeToLogFile(message: string): void {
  fs.appendFileSync(logFilePath, message)
}

export const logger = {
  info(message: string, meta?: any): void {
    const logMessage = formatLogMessage("info", message, meta)
    console.log(logMessage)
    writeToLogFile(logMessage)
  },

  warn(message: string, meta?: any): void {
    const logMessage = formatLogMessage("warn", message, meta)
    console.warn(logMessage)
    writeToLogFile(logMessage)
  },

  error(message: string, meta?: any): void {
    const logMessage = formatLogMessage("error", message, meta)
    console.error(logMessage)
    writeToLogFile(logMessage)
  },

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== "production") {
      const logMessage = formatLogMessage("debug", message, meta)
      console.debug(logMessage)
      writeToLogFile(logMessage)
    }
  },
}

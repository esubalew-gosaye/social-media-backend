import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { PrismaClient } from "@prisma/client"
import { typeDefs } from './schema/typeDefs';
import { resolvers } from "./resolvers"
import { verifyToken } from "./utils/auth"
import { logger } from "./utils/logger"

interface ContextValue {
  prisma: PrismaClient
  userId?: number
  userRole?: string
  isAuthenticated: boolean
}

async function startServer() {
  const prisma = new PrismaClient()

  // Create Apollo Server
  const server = new ApolloServer<ContextValue>({
    typeDefs,
    resolvers,
    formatError: (error) => {
      // Customize the error response
      return {
        message: error.message,
        code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
        path: error.path,
      };
    },
  })

  // Start the server
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      // Default context
      const context: ContextValue = {
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
    },
    listen: { port: Number(process.env.PORT) || 4000 },
  })

  logger.info(`🚀 Server ready at ${url}`)

  // Handle shutdown
  process.on("SIGINT", async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

startServer().catch((error) => {
  logger.error("Failed to start server:", error)
  process.exit(1)
})

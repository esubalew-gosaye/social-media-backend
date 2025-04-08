import type { Context } from "../context"
import { comparePasswords, generateToken, hashPassword } from "../utils/auth"
import { logger } from "../utils/logger"

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      return context.prisma.user.findUnique({
        where: { id: context.userId },
      })
    },

    user: async (_: any, { id }: { id: number }, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id },
      })
    },

    users: async (_: any, __: any, context: Context) => {
      // Only admins can list all users
      if (context.userRole !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return context.prisma.user.findMany()
    },
  },

  Mutation: {
    signup: async (_: any, { data }: { data: any }, context: Context) => {
      const { email, password, name, role } = data

      // Check if user already exists
      const existingUser = await context.prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new Error("Email already in use")
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Create new user
      const user = await context.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: role || "USER",
        },
      })

      logger.info(`New user created: ${user.id}`)

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      return {
        token,
        user,
      }
    },

    login: async (_: any, { data }: { data: any }, context: Context) => {
      const { email, password } = data

      // Find user by email
      const user = await context.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Verify password
      const validPassword = await comparePasswords(password, user.password)

      if (!validPassword) {
        throw new Error("Invalid email or password")
      }

      logger.info(`User logged in: ${user.id}`)

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      return {
        token,
        user,
      }
    },
  },

  User: {
    posts: async (parent: any, _: any, context: Context) => {
      return context.prisma.post.findMany({
        where: { authorId: parent.id },
      })
    },

    comments: async (parent: any, _: any, context: Context) => {
      return context.prisma.comment.findMany({
        where: { authorId: parent.id },
      })
    },

    likes: async (parent: any, _: any, context: Context) => {
      return context.prisma.like.findMany({
        where: { userId: parent.id },
      })
    },

    ratings: async (parent: any, _: any, context: Context) => {
      return context.prisma.rating.findMany({
        where: { userId: parent.id },
      })
    },
  },
}


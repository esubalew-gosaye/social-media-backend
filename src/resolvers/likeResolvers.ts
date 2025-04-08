import type { Context } from "../context"
import { logger } from "../utils/logger"

export const likeResolvers = {
  Query: {
    likes: async (_: any, { postId, userId }: { postId: number; userId?: number }, context: Context) => {
      const where: any = { postId }

      if (userId) {
        where.userId = userId
      }

      return context.prisma.like.findMany({ where })
    },
  },

  Mutation: {
    likePost: async (_: any, { postId }: { postId: number }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      // Check if post exists
      const post = await context.prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Check if user already liked the post
      const existingLike = await context.prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: context.userId,
            postId,
          },
        },
      })

      if (existingLike) {
        return existingLike // User already liked the post
      }

      // Create new like
      const like = await context.prisma.like.create({
        data: {
          userId: context.userId,
          postId,
        },
      })

      logger.info(`Post ${postId} liked by user ${context.userId}`)

      return like
    },

    unlikePost: async (_: any, { postId }: { postId: number }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      // Check if like exists
      const like = await context.prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: context.userId,
            postId,
          },
        },
      })

      if (!like) {
        throw new Error("Like not found")
      }

      // Delete like
      const deletedLike = await context.prisma.like.delete({
        where: {
          userId_postId: {
            userId: context.userId,
            postId,
          },
        },
      })

      logger.info(`Post ${postId} unliked by user ${context.userId}`)

      return deletedLike
    },
  },

  Like: {
    user: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId },
      })
    },

    post: async (parent: any, _: any, context: Context) => {
      return context.prisma.post.findUnique({
        where: { id: parent.postId },
      })
    },
  },
}


import type { Context } from "../context"
import { logger } from "../utils/logger"

export const ratingResolvers = {
  Query: {
    ratings: async (_: any, { postId, userId }: { postId: number; userId?: number }, context: Context) => {
      const where: any = { postId }

      if (userId) {
        where.userId = userId
      }

      return context.prisma.rating.findMany({ where })
    },
  },

  Mutation: {
    ratePost: async (_: any, { data }: { data: any }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      const { postId, value } = data

      // Validate rating value (1-5)
      if (value < 1 || value > 5) {
        throw new Error("Rating value must be between 1 and 5")
      }

      // Check if post exists
      const post = await context.prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Check if user already rated the post
      const existingRating = await context.prisma.rating.findUnique({
        where: {
          userId_postId: {
            userId: context.userId,
            postId,
          },
        },
      })

      if (existingRating) {
        // Update existing rating
        const updatedRating = await context.prisma.rating.update({
          where: {
            userId_postId: {
              userId: context.userId,
              postId,
            },
          },
          data: { value },
        })

        logger.info(`Rating updated for post ${postId} by user ${context.userId}: ${value}`)

        return updatedRating
      }

      // Create new rating
      const rating = await context.prisma.rating.create({
        data: {
          value,
          userId: context.userId,
          postId,
        },
      })

      logger.info(`Post ${postId} rated by user ${context.userId}: ${value}`)

      return rating
    },

    updateRating: async (_: any, { id, data }: { id: number; data: any }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      // Validate rating value (1-5)
      if (data.value < 1 || data.value > 5) {
        throw new Error("Rating value must be between 1 and 5")
      }

      // Check if rating exists and belongs to user
      const rating = await context.prisma.rating.findUnique({
        where: { id },
      })

      if (!rating) {
        throw new Error("Rating not found")
      }

      if (rating.userId !== context.userId) {
        throw new Error("Not authorized to update this rating")
      }

      // Update rating
      const updatedRating = await context.prisma.rating.update({
        where: { id },
        data: { value: data.value },
      })

      logger.info(`Rating ${id} updated by user ${context.userId}: ${data.value}`)

      return updatedRating
    },

    deleteRating: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      // Check if rating exists and belongs to user
      const rating = await context.prisma.rating.findUnique({
        where: { id },
      })

      if (!rating) {
        throw new Error("Rating not found")
      }

      if (rating.userId !== context.userId) {
        throw new Error("Not authorized to delete this rating")
      }

      // Delete rating
      const deletedRating = await context.prisma.rating.delete({
        where: { id },
      })

      logger.info(`Rating ${id} deleted by user ${context.userId}`)

      return deletedRating
    },
  },

  Rating: {
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


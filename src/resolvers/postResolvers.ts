import type { Context } from "../context"
import { logger } from "../utils/logger"

export const postResolvers = {
  Query: {
    post: async (_: any, { id }: { id: number }, context: Context) => {
      const post = await context.prisma.post.findUnique({
        where: { id },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // If post is not published, only the author or admin can see it
      if (
        !post.published &&
        (!context.isAuthenticated || (post.authorId !== context.userId && context.userRole !== "ADMIN"))
      ) {
        throw new Error("Not authorized to view this post")
      }

      return post
    },

    posts: async (_: any, args: any, context: Context) => {
      const { published, authorId, skip, take, orderBy } = args

      // Build filter conditions
      const where: any = {}

      if (published !== undefined) {
        where.published = published
      }

      if (authorId) {
        where.authorId = authorId
      }

      // If user is not authenticated or not an admin, only show published posts
      if (!context.isAuthenticated || context.userRole !== "ADMIN") {
        where.published = true
      }

      // Build ordering
      let orderByObj = {}
      if (orderBy) {
        if (orderBy === "createdAt_DESC") {
          orderByObj = { createdAt: "desc" }
        } else if (orderBy === "createdAt_ASC") {
          orderByObj = { createdAt: "asc" }
        }
      } else {
        // Default ordering
        orderByObj = { createdAt: "desc" }
      }

      return context.prisma.post.findMany({
        where,
        skip: skip || undefined,
        take: take || undefined,
        orderBy: orderByObj,
      })
    },
  },

  Mutation: {
    createPost: async (_: any, { data }: { data: any }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      const { title, content, published = false } = data

      const post = await context.prisma.post.create({
        data: {
          title,
          content,
          published,
          authorId: context.userId,
        },
      })

      logger.info(`Post created: ${post.id} by user ${context.userId}`)

      return post
    },

    updatePost: async (_: any, { id, data }: { id: number; data: any }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      // Check if post exists and user is authorized
      const post = await context.prisma.post.findUnique({
        where: { id },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Only author or admin can update post
      if (post.authorId !== context.userId && context.userRole !== "ADMIN") {
        throw new Error("Not authorized to update this post")
      }

      const updatedPost = await context.prisma.post.update({
        where: { id },
        data,
      })

      logger.info(`Post updated: ${id} by user ${context.userId}`)

      return updatedPost
    },

    deletePost: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      // Check if post exists and user is authorized
      const post = await context.prisma.post.findUnique({
        where: { id },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      // Only author or admin can delete post
      if (post.authorId !== context.userId && context.userRole !== "ADMIN") {
        throw new Error("Not authorized to delete this post")
      }

      const deletedPost = await context.prisma.post.delete({
        where: { id },
      })

      logger.info(`Post deleted: ${id} by user ${context.userId}`)

      return deletedPost
    },
  },

  Post: {
    author: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.authorId },
      })
    },

    comments: async (parent: any, _: any, context: Context) => {
      return context.prisma.comment.findMany({
        where: {
          postId: parent.id,
          parentCommentId: null, 
        },
      })
    },

    likes: async (parent: any, _: any, context: Context) => {
      return context.prisma.like.findMany({
        where: { postId: parent.id },
      })
    },

    ratings: async (parent: any, _: any, context: Context) => {
      return context.prisma.rating.findMany({
        where: { postId: parent.id },
      })
    },

    likeCount: async (parent: any, _: any, context: Context) => {
      return context.prisma.like.count({
        where: { postId: parent.id },
      })
    },

    averageRating: async (parent: any, _: any, context: Context) => {
      const ratings = await context.prisma.rating.findMany({
        where: { postId: parent.id },
        select: { value: true },
      })

      if (ratings.length === 0) {
        return null
      }

      const sum = ratings.reduce((acc, rating) => acc + rating.value, 0)
      return sum / ratings.length
    },
  },
}


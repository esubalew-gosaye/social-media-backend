import type { Context } from "../context"
import { logger } from "../utils/logger"

export const commentResolvers = {
  Query: {
    comment: async (_: any, { id }: { id: number }, context: Context) => {
      return context.prisma.comment.findUnique({
        where: { id },
      })
    },

    comments: async (_: any, args: any, context: Context) => {
      const { postId, authorId, parentCommentId, skip, take } = args

      const where: any = {}

      if (postId) {
        where.postId = postId
      }

      if (authorId) {
        where.authorId = authorId
      }

      if (parentCommentId !== undefined) {
        where.parentCommentId = parentCommentId
      }

      return context.prisma.comment.findMany({
        where,
        skip: skip || undefined,
        take: take || undefined,
        orderBy: { createdAt: "desc" },
      })
    },
  },

  Mutation: {
    createComment: async (_: any, { data }: { data: any }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      const { content, postId, parentCommentId } = data

      // Check if post exists
      const post = await context.prisma.post.findUnique({
        where: { id: postId },
      })

      if (!post) {
        throw new Error("Post not found")
      }

      if (parentCommentId) {
        const parentComment = await context.prisma.comment.findUnique({
          where: { id: parentCommentId },
        })

        if (!parentComment) {
          throw new Error("Parent comment not found")
        }

        if (parentComment.postId !== postId) {
          throw new Error("Parent comment does not belong to the specified post")
        }
      }

      const comment = await context.prisma.comment.create({
        data: {
          content,
          authorId: context.userId,
          postId,
          parentCommentId: parentCommentId || null,
        },
      })

      logger.info(`Comment created: ${comment.id} by user ${context.userId}`)

      return comment
    },

    updateComment: async (_: any, { id, data }: { id: number; data: any }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      const comment = await context.prisma.comment.findUnique({
        where: { id },
      })

      if (!comment) {
        throw new Error("Comment not found")
      }

      // Only author or admin can update comment
      if (comment.authorId !== context.userId && context.userRole !== "ADMIN") {
        throw new Error("Not authorized to update this comment")
      }

      const updatedComment = await context.prisma.comment.update({
        where: { id },
        data: { content: data.content },
      })

      logger.info(`Comment updated: ${id} by user ${context.userId}`)

      return updatedComment
    },

    deleteComment: async (_: any, { id }: { id: number }, context: Context) => {
      if (!context.isAuthenticated || !context.userId) {
        throw new Error("Not authenticated")
      }

      // Check if comment exists
      const comment = await context.prisma.comment.findUnique({
        where: { id },
      })

      if (!comment) {
        throw new Error("Comment not found")
      }

      // Only author or admin can delete comment
      if (comment.authorId !== context.userId && context.userRole !== "ADMIN") {
        throw new Error("Not authorized to delete this comment")
      }

      const deletedComment = await context.prisma.comment.delete({
        where: { id },
      })

      logger.info(`Comment deleted: ${id} by user ${context.userId}`)

      return deletedComment
    },
  },

  Comment: {
    author: async (parent: any, _: any, context: Context) => {
      return context.prisma.user.findUnique({
        where: { id: parent.authorId },
      })
    },

    post: async (parent: any, _: any, context: Context) => {
      return context.prisma.post.findUnique({
        where: { id: parent.postId },
      })
    },

    parentComment: async (parent: any, _: any, context: Context) => {
      if (!parent.parentCommentId) {
        return null
      }

      return context.prisma.comment.findUnique({
        where: { id: parent.parentCommentId },
      })
    },

    replies: async (parent: any, _: any, context: Context) => {
      return context.prisma.comment.findMany({
        where: { parentCommentId: parent.id },
      })
    },
  },
}

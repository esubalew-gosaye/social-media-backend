import { userResolvers } from "./userResolvers"
import { postResolvers } from "./postResolvers"
import { commentResolvers } from "./commentResolvers"
import { likeResolvers } from "./likeResolvers"
import { ratingResolvers } from "./ratingResolvers"

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...likeResolvers.Query,
    ...ratingResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...likeResolvers.Mutation,
    ...ratingResolvers.Mutation,
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
  Comment: commentResolvers.Comment,
  Like: likeResolvers.Like,
  Rating: ratingResolvers.Rating,
}


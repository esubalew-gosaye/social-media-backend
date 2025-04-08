export const typeDefs = `#graphql
  enum Role {
    USER
    ADMIN
  }

  type User {
    id: Int!
    email: String!
    name: String
    role: Role!
    posts: [Post!]
    comments: [Comment!]
    likes: [Like!]
    ratings: [Rating!]
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: Int!
    title: String!
    content: String!
    published: Boolean!
    author: User!
    authorId: Int!
    comments: [Comment!]
    likes: [Like!]
    ratings: [Rating!]
    createdAt: String!
    updatedAt: String!
    likeCount: Int!
    averageRating: Float
  }

  type Comment {
    id: Int!
    content: String!
    author: User!
    authorId: Int!
    post: Post!
    postId: Int!
    parentComment: Comment
    parentCommentId: Int
    replies: [Comment!]
    createdAt: String!
    updatedAt: String!
  }

  type Like {
    id: Int!
    user: User!
    userId: Int!
    post: Post!
    postId: Int!
    createdAt: String!
  }

  type Rating {
    id: Int!
    value: Int!
    user: User!
    userId: Int!
    post: Post!
    postId: Int!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateUserInput {
    email: String!
    password: String!
    name: String
    role: Role
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
    published: Boolean
  }

  input UpdatePostInput {
    title: String
    content: String
    published: Boolean
  }

  input CreateCommentInput {
    content: String!
    postId: Int!
    parentCommentId: Int
  }

  input UpdateCommentInput {
    content: String!
  }

  input CreateRatingInput {
    postId: Int!
    value: Int!
  }

  input UpdateRatingInput {
    value: Int!
  }

  type Query {
    # User queries
    me: User
    user(id: Int!): User
    users: [User!]!

    # Post queries
    post(id: Int!): Post
    posts(
      published: Boolean
      authorId: Int
      skip: Int
      take: Int
      orderBy: String
    ): [Post!]!

    # Comment queries
    comment(id: Int!): Comment
    comments(
      postId: Int
      authorId: Int
      parentCommentId: Int
      skip: Int
      take: Int
    ): [Comment!]!

    # Like queries
    likes(postId: Int!, userId: Int): [Like!]!

    # Rating queries
    ratings(postId: Int!, userId: Int): [Rating!]!
  }

  type Mutation {
    # Auth mutations
    signup(data: CreateUserInput!): AuthPayload!
    login(data: LoginInput!): AuthPayload!

    # Post mutations
    createPost(data: CreatePostInput!): Post!
    updatePost(id: Int!, data: UpdatePostInput!): Post!
    deletePost(id: Int!): Post!

    # Comment mutations
    createComment(data: CreateCommentInput!): Comment!
    updateComment(id: Int!, data: UpdateCommentInput!): Comment!
    deleteComment(id: Int!): Comment!

    # Like mutations
    likePost(postId: Int!): Like!
    unlikePost(postId: Int!): Like!

    # Rating mutations
    ratePost(data: CreateRatingInput!): Rating!
    updateRating(id: Int!, data: UpdateRatingInput!): Rating!
    deleteRating(id: Int!): Rating!
  }
`

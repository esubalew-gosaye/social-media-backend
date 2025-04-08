import { PrismaClient, Role } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: await hash("admin123", 10),
      role: Role.ADMIN,
    },
  })

  const regularUser1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      email: "user1@example.com",
      name: "Regular User 1",
      password: await hash("user123", 10),
      role: Role.USER,
    },
  })

  const regularUser2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      name: "Regular User 2",
      password: await hash("user123", 10),
      role: Role.USER,
    },
  })

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: "First Post",
      content: "This is the first post content.",
      published: true,
      authorId: regularUser1.id,
    },
  })

  const post2 = await prisma.post.create({
    data: {
      title: "Second Post",
      content: "This is the second post content.",
      published: true,
      authorId: regularUser2.id,
    },
  })

  const post3 = await prisma.post.create({
    data: {
      title: "Draft Post",
      content: "This is a draft post.",
      published: false,
      authorId: regularUser1.id,
    },
  })

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      content: "Great post!",
      authorId: regularUser2.id,
      postId: post1.id,
    },
  })

  const comment2 = await prisma.comment.create({
    data: {
      content: "I agree with this.",
      authorId: adminUser.id,
      postId: post1.id,
    },
  })

  // Create nested comment (reply)
  const reply1 = await prisma.comment.create({
    data: {
      content: "Thanks for your comment!",
      authorId: regularUser1.id,
      postId: post1.id,
      parentCommentId: comment1.id,
    },
  })

  // Create likes
  await prisma.like.create({
    data: {
      userId: regularUser1.id,
      postId: post2.id,
    },
  })

  await prisma.like.create({
    data: {
      userId: regularUser2.id,
      postId: post1.id,
    },
  })

  await prisma.like.create({
    data: {
      userId: adminUser.id,
      postId: post1.id,
    },
  })

  // Create ratings
  await prisma.rating.create({
    data: {
      value: 5,
      userId: regularUser1.id,
      postId: post2.id,
    },
  })

  await prisma.rating.create({
    data: {
      value: 4,
      userId: regularUser2.id,
      postId: post1.id,
    },
  })

  await prisma.rating.create({
    data: {
      value: 5,
      userId: adminUser.id,
      postId: post1.id,
    },
  })

  console.log("Seed data created successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

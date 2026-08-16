import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

const AUTHOR_SELECT = {
  id: true,
  name: true,
  avatarUrl: true,
  role: true,
} satisfies Prisma.UserSelect;

function toPostShape(post: any, currentUserId: string) {
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
    author: post.author,
    isLikedByMe: post.likes?.some((l: any) => l.userId === currentUserId) ?? false,
    isMine: post.authorId === currentUserId,
  };
}

export async function listPosts(currentUserId: string, cursor?: string, take = 15) {
  const posts = await prisma.communityPost.findMany({
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: AUTHOR_SELECT },
      likes: { where: { userId: currentUserId }, select: { userId: true } },
    },
  });

  return {
    items: posts.map((p) => toPostShape(p, currentUserId)),
    nextCursor: posts.length === take ? posts[posts.length - 1].id : null,
  };
}

export async function createPost(authorId: string, content: string, imageUrl?: string) {
  if (!content?.trim()) {
    const err: any = new Error("Post content cannot be empty");
    err.statusCode = 400;
    throw err;
  }
  const post = await prisma.communityPost.create({
    data: { authorId, content: content.trim(), imageUrl: imageUrl ?? null },
    include: { author: { select: AUTHOR_SELECT }, likes: true },
  });
  return toPostShape(post, authorId);
}

export async function deletePost(userId: string, postId: string) {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) {
    const err: any = new Error("Post not found");
    err.statusCode = 404;
    throw err;
  }
  if (post.authorId !== userId) {
    const err: any = new Error("Not allowed to delete this post");
    err.statusCode = 403;
    throw err;
  }
  await prisma.communityPost.delete({ where: { id: postId } });
  return { id: postId };
}

export async function toggleLike(userId: string, postId: string) {
  const existing = await prisma.communityPostLike.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.communityPostLike.delete({ where: { id: existing.id } }),
      prisma.communityPost.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.communityPostLike.create({ data: { postId, userId } }),
    prisma.communityPost.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } }),
  ]);
  return { liked: true };
}

export async function listComments(postId: string) {
  const comments = await prisma.communityComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: AUTHOR_SELECT } },
  });
  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    author: c.author,
  }));
}

export async function addComment(userId: string, postId: string, content: string) {
  if (!content?.trim()) {
    const err: any = new Error("Comment cannot be empty");
    err.statusCode = 400;
    throw err;
  }
  const [comment] = await prisma.$transaction([
    prisma.communityComment.create({
      data: { postId, authorId: userId, content: content.trim() },
      include: { author: { select: AUTHOR_SELECT } },
    }),
    prisma.communityPost.update({ where: { id: postId }, data: { commentsCount: { increment: 1 } } }),
  ]);
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: comment.author,
  };
}
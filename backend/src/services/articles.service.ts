import { prisma } from "../prisma";

type CreateArticleInput = {
  expertUserId: string;

  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  readTimeMinutes: number;
  isPublished: boolean;
};

export async function createArticle(data: CreateArticleInput) {
  // Find the logged-in user's ExpertProfile
  const expert = await prisma.expertProfile.findUnique({
    where: {
      userId: data.expertUserId,
    },
  });

  if (!expert) {
    throw new Error("Expert profile not found.");
  }

  // Prevent duplicate slugs
  const existingArticle = await prisma.article.findUnique({
    where: {
      slug: data.slug,
    },
  });

  if (existingArticle) {
    throw new Error("An article with this slug already exists.");
  }

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      category: data.category,
      excerpt: data.excerpt,
      content: data.content,
      readTimeMinutes: data.readTimeMinutes,
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,

      expertProfileId: expert.id,
    },
    include: {
      expertProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return article;
}

export async function getAllArticles() {
  return prisma.article.findMany({
    include: {
      expertProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPublishedArticles() {
  return prisma.article.findMany({
    where: {
      isPublished: true,
    },
    include: {
      expertProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: {
      slug,
    },
    include: {
      expertProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}
import { prisma } from "../prisma";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getExpertProfileId(userId: string): Promise<string> {
  const expertProfile = await prisma.expertProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!expertProfile) {
    throw new Error("Profil experte introuvable.");
  }

  return expertProfile.id;
}

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function createUniqueSlug(title: string): Promise<string> {
  const baseSlug = makeSlug(title) || `cours-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

async function createUniqueArticleSlug(title: string): Promise<string> {
  const baseSlug = makeSlug(title) || `article-${Date.now()}`;

  let slug = baseSlug;
  let counter = 1;

  while (
    await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/* -------------------------------------------------------------------------- */
/* Courses                                                                    */
/* -------------------------------------------------------------------------- */

export async function getMyCourses(userId: string) {
  const expertProfileId = await getExpertProfileId(userId);

  return prisma.course.findMany({
    where: {
      expertProfileId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      articles: {
        orderBy: {
          order: "asc",
        },
      },
      videos: {
        orderBy: {
          order: "asc",
        },
      },
      resources: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function getPublishedCourses() {
  return prisma.course.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      articles: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      videos: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      resources: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

/**
 * Expert gets his own course, regardless of publication status.
 */
export async function getCourseById(
  courseId: string,
  userId: string
) {
  const expertProfileId = await getExpertProfileId(userId);

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      expertProfileId,
    },
    include: {
      articles: {
        orderBy: {
          order: "asc",
        },
      },
      videos: {
        orderBy: {
          order: "asc",
        },
      },
      resources: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    throw new Error("Cours introuvable.");
  }

  return course;
}

/**
 * Non-expert users can only access published courses.
 */
export async function getPublishedCourseById(courseId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      articles: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      videos: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      resources: {
        where: {
          isPublished: true,
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!course) {
    throw new Error("Cours introuvable.");
  }

  return course;
}

export async function createCourse(
  userId: string,
  input: {
    title: string;
    description: string;
    category: string;
    level: string;
    durationMinutes?: number;
    coverUrl?: string | null;
    isPublished?: boolean;
  }
) {
  const expertProfileId = await getExpertProfileId(userId);

  const slug = await createUniqueSlug(input.title);

  return prisma.course.create({
    data: {
      slug,
      title: input.title,
      description: input.description,
      category: input.category,
      level: input.level,
      durationMinutes: input.durationMinutes ?? 0,
      coverUrl: input.coverUrl ?? null,
      isPublished: input.isPublished ?? false,
      expertProfileId,
    },
    include: {
      articles: true,
      videos: true,
      resources: true,
    },
  });
}

export async function updateCourse(
  courseId: string,
  userId: string,
  input: {
    title?: string;
    description?: string;
    category?: string;
    level?: string;
    durationMinutes?: number;
    coverUrl?: string | null;
    isPublished?: boolean;
  }
) {
  const expertProfileId = await getExpertProfileId(userId);

  const existing = await prisma.course.findFirst({
    where: {
      id: courseId,
      expertProfileId,
    },
  });

  if (!existing) {
    throw new Error("Cours introuvable.");
  }

  let slug = existing.slug;

  if (
    input.title !== undefined &&
    input.title.trim() !== existing.title.trim()
  ) {
    slug = await createUniqueSlug(input.title);
  }

  return prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      ...(input.title !== undefined && {
        title: input.title,
        slug,
      }),

      ...(input.description !== undefined && {
        description: input.description,
      }),

      ...(input.category !== undefined && {
        category: input.category,
      }),

      ...(input.level !== undefined && {
        level: input.level,
      }),

      ...(input.durationMinutes !== undefined && {
        durationMinutes: input.durationMinutes,
      }),

      ...(input.coverUrl !== undefined && {
        coverUrl: input.coverUrl,
      }),

      ...(input.isPublished !== undefined && {
        isPublished: input.isPublished,
      }),
    },
    include: {
      articles: {
        orderBy: {
          order: "asc",
        },
      },
      videos: {
        orderBy: {
          order: "asc",
        },
      },
      resources: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}

export async function deleteCourse(
  courseId: string,
  userId: string
) {
  const expertProfileId = await getExpertProfileId(userId);

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      expertProfileId,
    },
  });

  if (!course) {
    throw new Error("Cours introuvable.");
  }

  return prisma.course.delete({
    where: {
      id: courseId,
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Course ownership                                                           */
/* -------------------------------------------------------------------------- */

async function verifyCourseOwnership(
  courseId: string,
  userId: string
) {
  const expertProfileId = await getExpertProfileId(userId);

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      expertProfileId,
    },
    select: {
      id: true,
      category: true,
    },
  });

  if (!course) {
    throw new Error("Cours introuvable.");
  }

  return {
    course,
    expertProfileId,
  };
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                   */
/* -------------------------------------------------------------------------- */

export async function getArticles(
  courseId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  return prisma.article.findMany({
    where: {
      courseId,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function getArticle(
  courseId: string,
  articleId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      courseId,
    },
  });

  if (!article) {
    throw new Error("Article introuvable.");
  }

  return article;
}

export async function createArticle(
  courseId: string,
  userId: string,
  input: {
    title: string;
    excerpt?: string;
    content: string;
    category?: string;
    coverUrl?: string | null;
    pdfUrl?: string | null;
    readTimeMinutes?: number;
    isPublished?: boolean;
  }
) {
  const {
    course,
    expertProfileId,
  } = await verifyCourseOwnership(courseId, userId);

  const slug = await createUniqueArticleSlug(input.title);

  const lastArticle = await prisma.article.findFirst({
    where: {
      courseId,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  const order = (lastArticle?.order ?? -1) + 1;

  const article = await prisma.article.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt ?? "",
      content: input.content,
      category: input.category ?? course.category,
      coverUrl: input.coverUrl ?? null,

      // This is now expected to be a B2 URL.
      pdfUrl: input.pdfUrl ?? null,

      readTimeMinutes: input.readTimeMinutes ?? 5,
      isPublished: input.isPublished ?? false,
      publishedAt: input.isPublished ? new Date() : null,
      order,
      expertProfileId,
      courseId,
    },
  });

  await updateCourseLessonCount(courseId);

  return article;
}

export async function updateArticle(
  courseId: string,
  articleId: string,
  userId: string,
  input: {
    title?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    coverUrl?: string | null;
    pdfUrl?: string | null;
    readTimeMinutes?: number;
    isPublished?: boolean;
    order?: number;
  }
) {
  await verifyCourseOwnership(courseId, userId);

  const existing = await prisma.article.findFirst({
    where: {
      id: articleId,
      courseId,
    },
  });

  if (!existing) {
    throw new Error("Article introuvable.");
  }

  let slug = existing.slug;

  if (
    input.title !== undefined &&
    input.title.trim() !== existing.title.trim()
  ) {
    slug = await createUniqueArticleSlug(input.title);
  }

  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      ...(input.title !== undefined && {
        title: input.title,
        slug,
      }),

      ...(input.excerpt !== undefined && {
        excerpt: input.excerpt,
      }),

      ...(input.content !== undefined && {
        content: input.content,
      }),

      ...(input.category !== undefined && {
        category: input.category,
      }),

      ...(input.coverUrl !== undefined && {
        coverUrl: input.coverUrl,
      }),

      ...(input.pdfUrl !== undefined && {
        pdfUrl: input.pdfUrl,
      }),

      ...(input.readTimeMinutes !== undefined && {
        readTimeMinutes: input.readTimeMinutes,
      }),

      ...(input.isPublished !== undefined && {
        isPublished: input.isPublished,
        publishedAt: input.isPublished
          ? existing.publishedAt ?? new Date()
          : null,
      }),

      ...(input.order !== undefined && {
        order: input.order,
      }),
    },
  });
}

export async function deleteArticle(
  courseId: string,
  articleId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      courseId,
    },
  });

  if (!article) {
    throw new Error("Article introuvable.");
  }

  const result = await prisma.article.delete({
    where: {
      id: articleId,
    },
  });

  await updateCourseLessonCount(courseId);

  return result;
}

/* -------------------------------------------------------------------------- */
/* Videos                                                                     */
/* -------------------------------------------------------------------------- */

export async function getVideos(
  courseId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  return prisma.video.findMany({
    where: {
      courseId,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function getVideo(
  courseId: string,
  videoId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  const video = await prisma.video.findFirst({
    where: {
      id: videoId,
      courseId,
    },
  });

  if (!video) {
    throw new Error("Vidéo introuvable.");
  }

  return video;
}

export async function createVideo(
  courseId: string,
  userId: string,
  input: {
    title: string;
    description?: string;
    durationSeconds?: number;
    thumbnailUrl?: string | null;
    videoUrl?: string | null;
    fileSizeBytes?: number | null;
    mimeType?: string | null;
    category?: string;
    isPublished?: boolean;
  }
) {
  const {
    course,
    expertProfileId,
  } = await verifyCourseOwnership(courseId, userId);

  const lastVideo = await prisma.video.findFirst({
    where: {
      courseId,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  const order = (lastVideo?.order ?? -1) + 1;

  const video = await prisma.video.create({
    data: {
      title: input.title,
      description: input.description ?? "",
      durationSeconds: input.durationSeconds ?? 0,
      thumbnailUrl: input.thumbnailUrl ?? null,

      // B2 URL
      videoUrl: input.videoUrl ?? null,

      fileSizeBytes:
        input.fileSizeBytes !== undefined &&
        input.fileSizeBytes !== null
          ? BigInt(input.fileSizeBytes)
          : null,

      mimeType: input.mimeType ?? null,

      category: input.category ?? course.category,
      isPublished: input.isPublished ?? false,
      order,
      expertProfileId,
      courseId,
    },
  });

  await updateCourseLessonCount(courseId);

  return video;
}

export async function updateVideo(
  courseId: string,
  videoId: string,
  userId: string,
  input: {
    title?: string;
    description?: string;
    durationSeconds?: number;
    thumbnailUrl?: string | null;
    videoUrl?: string | null;
    fileSizeBytes?: number | null;
    mimeType?: string | null;
    category?: string;
    isPublished?: boolean;
    order?: number;
  }
) {
  await verifyCourseOwnership(courseId, userId);

  const existing = await prisma.video.findFirst({
    where: {
      id: videoId,
      courseId,
    },
  });

  if (!existing) {
    throw new Error("Vidéo introuvable.");
  }

  return prisma.video.update({
    where: {
      id: videoId,
    },
    data: {
      ...(input.title !== undefined && {
        title: input.title,
      }),

      ...(input.description !== undefined && {
        description: input.description,
      }),

      ...(input.durationSeconds !== undefined && {
        durationSeconds: input.durationSeconds,
      }),

      ...(input.thumbnailUrl !== undefined && {
        thumbnailUrl: input.thumbnailUrl,
      }),

      ...(input.videoUrl !== undefined && {
        videoUrl: input.videoUrl,
      }),

      ...(input.fileSizeBytes !== undefined && {
        fileSizeBytes:
          input.fileSizeBytes === null
            ? null
            : BigInt(input.fileSizeBytes),
      }),

      ...(input.mimeType !== undefined && {
        mimeType: input.mimeType,
      }),

      ...(input.category !== undefined && {
        category: input.category,
      }),

      ...(input.isPublished !== undefined && {
        isPublished: input.isPublished,
      }),

      ...(input.order !== undefined && {
        order: input.order,
      }),
    },
  });
}

export async function deleteVideo(
  courseId: string,
  videoId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  const video = await prisma.video.findFirst({
    where: {
      id: videoId,
      courseId,
    },
  });

  if (!video) {
    throw new Error("Vidéo introuvable.");
  }

  const result = await prisma.video.delete({
    where: {
      id: videoId,
    },
  });

  await updateCourseLessonCount(courseId);

  return result;
}

/* -------------------------------------------------------------------------- */
/* Resources                                                                  */
/* -------------------------------------------------------------------------- */

export async function getResources(
  courseId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  return prisma.resource.findMany({
    where: {
      courseId,
    },
    orderBy: {
      order: "asc",
    },
  });
}

export async function getResource(
  courseId: string,
  resourceId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      courseId,
    },
  });

  if (!resource) {
    throw new Error("Ressource introuvable.");
  }

  return resource;
}

export async function createResource(
  courseId: string,
  userId: string,
  input: {
    title: string;
    description?: string;
    type: string;
    fileUrl?: string | null;
    coverUrl?: string | null;
    fileSizeBytes?: number | null;
    isPublished?: boolean;
  }
) {
  const {
    expertProfileId,
  } = await verifyCourseOwnership(courseId, userId);

  const lastResource = await prisma.resource.findFirst({
    where: {
      courseId,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  const order = (lastResource?.order ?? -1) + 1;

  const resource = await prisma.resource.create({
    data: {
      title: input.title,
      description: input.description ?? "",
      type: input.type,

      // B2 URL
      fileUrl: input.fileUrl ?? null,

      coverUrl: input.coverUrl ?? null,

      fileSizeBytes:
        input.fileSizeBytes !== undefined &&
        input.fileSizeBytes !== null
          ? BigInt(input.fileSizeBytes)
          : null,

      isPublished: input.isPublished ?? false,
      order,
      expertProfileId,
      courseId,
    },
  });

  await updateCourseLessonCount(courseId);

  return resource;
}

export async function updateResource(
  courseId: string,
  resourceId: string,
  userId: string,
  input: {
    title?: string;
    description?: string;
    type?: string;
    fileUrl?: string | null;
    coverUrl?: string | null;
    fileSizeBytes?: number | null;
    isPublished?: boolean;
    order?: number;
  }
) {
  await verifyCourseOwnership(courseId, userId);

  const existing = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      courseId,
    },
  });

  if (!existing) {
    throw new Error("Ressource introuvable.");
  }

  return prisma.resource.update({
    where: {
      id: resourceId,
    },
    data: {
      ...(input.title !== undefined && {
        title: input.title,
      }),

      ...(input.description !== undefined && {
        description: input.description,
      }),

      ...(input.type !== undefined && {
        type: input.type,
      }),

      ...(input.fileUrl !== undefined && {
        fileUrl: input.fileUrl,
      }),

      ...(input.coverUrl !== undefined && {
        coverUrl: input.coverUrl,
      }),

      ...(input.fileSizeBytes !== undefined && {
        fileSizeBytes:
          input.fileSizeBytes === null
            ? null
            : BigInt(input.fileSizeBytes),
      }),

      ...(input.isPublished !== undefined && {
        isPublished: input.isPublished,
      }),

      ...(input.order !== undefined && {
        order: input.order,
      }),
    },
  });
}

export async function deleteResource(
  courseId: string,
  resourceId: string,
  userId: string
) {
  await verifyCourseOwnership(courseId, userId);

  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      courseId,
    },
  });

  if (!resource) {
    throw new Error("Ressource introuvable.");
  }

  const result = await prisma.resource.delete({
    where: {
      id: resourceId,
    },
  });

  await updateCourseLessonCount(courseId);

  return result;
}

/* -------------------------------------------------------------------------- */
/* Lesson count                                                               */
/* -------------------------------------------------------------------------- */

async function updateCourseLessonCount(courseId: string) {
  const [articles, videos, resources] = await Promise.all([
    prisma.article.count({
      where: { courseId },
    }),

    prisma.video.count({
      where: { courseId },
    }),

    prisma.resource.count({
      where: { courseId },
    }),
  ]);

  await prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      lessonCount: articles + videos + resources,
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Published lesson                                                           */
/* -------------------------------------------------------------------------- */

export async function getPublishedLesson(
  courseId: string,
  lessonId: string
) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      isPublished: true,
    },
    select: {
      id: true,
    },
  });

  if (!course) {
    throw new Error("Cours introuvable.");
  }

  const [article, video, resource] = await Promise.all([
    prisma.article.findFirst({
      where: {
        id: lessonId,
        courseId,
        isPublished: true,
      },
    }),

    prisma.video.findFirst({
      where: {
        id: lessonId,
        courseId,
        isPublished: true,
      },
    }),

    prisma.resource.findFirst({
      where: {
        id: lessonId,
        courseId,
        isPublished: true,
      },
    }),
  ]);

  if (article) {
    return {
      type: "article" as const,
      data: article,
    };
  }

  if (video) {
    return {
      type: "video" as const,
      data: video,
    };
  }

  if (resource) {
    return {
      type: "resource" as const,
      data: resource,
    };
  }

  throw new Error("Leçon introuvable.");
}
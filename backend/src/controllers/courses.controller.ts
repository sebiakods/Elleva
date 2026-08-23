import { Request, Response, NextFunction } from "express";
import * as coursesService from "../services/courses.service";
import { uploadToB2, getB2SignedUrl } from "../config/b2";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getUserId(req: Request): string {
  if (!req.user?.id) {
    throw new Error("Utilisateur non authentifié.");
  }

  return req.user.id;
}

function getParam(req: Request, name: string): string {
  const value = req.params[name];

  if (!value || typeof value !== "string") {
    throw new Error(`Paramètre ${name} manquant.`);
  }

  return value;
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function booleanOrUndefined(value: unknown): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function getFiles(
  req: Request
): Record<string, Express.Multer.File[]> {
  if (!req.files) {
    if (req.file) {
      return {
        single: [req.file],
      };
    }

    return {};
  }

  if (Array.isArray(req.files)) {
    return {
      files: req.files,
    };
  }

  return req.files as Record<string, Express.Multer.File[]>;
}


function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === "bigint" ? Number(item) : item
    )
  );
}

/* -------------------------------------------------------------------------- */
/* B2 SIGNED URL HELPERS                                                      */
/* -------------------------------------------------------------------------- */

async function signB2File(
  value: string | null | undefined
): Promise<string | null | undefined> {
  if (!value) {
    return value;
  }

  try {
    return await getB2SignedUrl(value, 3600);
  } catch (error) {
    console.error("❌ Failed to generate B2 signed URL:", {
      value,
      error,
    });

    return null;
  }
}


async function signCourseFiles(course: any) {
  const result = serialize(course);

  /* Course cover */
  if (result.coverUrl) {
    result.coverUrl = await signB2File(result.coverUrl);
  }

  /* Articles */
  if (Array.isArray(result.articles)) {
    for (const article of result.articles) {
      if (article.pdfUrl) {
        article.pdfUrl = await signB2File(article.pdfUrl);
      }

      if (article.coverUrl) {
        article.coverUrl = await signB2File(article.coverUrl);
      }
    }
  }

  /* Videos */
  if (Array.isArray(result.videos)) {
    for (const video of result.videos) {
      if (video.videoUrl) {
        video.videoUrl = await signB2File(video.videoUrl);
      }

      if (video.thumbnailUrl) {
        video.thumbnailUrl = await signB2File(video.thumbnailUrl);
      }
    }
  }

  /* Resources */
  if (Array.isArray(result.resources)) {
    for (const resource of result.resources) {
      if (resource.fileUrl) {
        resource.fileUrl = await signB2File(resource.fileUrl);
      }

      if (resource.coverUrl) {
        resource.coverUrl = await signB2File(resource.coverUrl);
      }
    }
  }

  return result;
}


async function signArticleFiles(article: any) {
  const result = serialize(article);

  if (result.pdfUrl) {
    result.pdfUrl = await signB2File(result.pdfUrl);
  }

  if (result.coverUrl) {
    result.coverUrl = await signB2File(result.coverUrl);
  }

  return result;
}

async function signVideoFiles(video: any) {
  const result = serialize(video);

  if (result.videoUrl) {
    result.videoUrl = await signB2File(result.videoUrl);
  }

  if (result.thumbnailUrl) {
    result.thumbnailUrl = await signB2File(result.thumbnailUrl);
  }

  return result;
}


async function signResourceFiles(resource: any) {
  const result = serialize(resource);

  if (result.fileUrl) {
    result.fileUrl = await signB2File(result.fileUrl);
  }

  if (result.coverUrl) {
    result.coverUrl = await signB2File(result.coverUrl);
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Courses                                                                    */
/* -------------------------------------------------------------------------- */

export async function getMyCourses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);

    const courses = await coursesService.getMyCourses(userId);

    const signedCourses = await Promise.all(courses.map(signCourseFiles));

    return res.status(200).json({
      success: true,
      data: signedCourses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublishedCourses(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courses = await coursesService.getPublishedCourses();

    const signedCourses = await Promise.all(courses.map(signCourseFiles));

    return res.json({
      success: true,
      data: signedCourses,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = getParam(req, "id");

    const course =
      req.user?.role === "EXPERT"
        ? await coursesService.getCourseById(courseId, getUserId(req))
        : await coursesService.getPublishedCourseById(courseId);

    const signedCourse = await signCourseFiles(course);

    return res.json({
      success: true,
      data: signedCourse,
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* CREATE COURSE                                                              */
/* -------------------------------------------------------------------------- */

export async function createCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);

    const {
      title,
      description,
      category,
      level,
      durationMinutes,
      coverUrl,
      isPublished,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le titre du cours est obligatoire.",
      });
    }

    if (!description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "La description du cours est obligatoire.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "La catégorie du cours est obligatoire.",
      });
    }

    if (!level?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le niveau du cours est obligatoire.",
      });
    }

    const files = getFiles(req);

    let finalCoverUrl = coverUrl || null;

    if (files.cover?.[0]) {
      finalCoverUrl = await uploadToB2(files.cover[0], "courses/covers");
    }

    const course = await coursesService.createCourse(userId, {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level: level.trim(),
      durationMinutes: numberOrUndefined(durationMinutes) ?? 0,
      coverUrl: finalCoverUrl,
      isPublished: booleanOrUndefined(isPublished) ?? false,
    });

    const signedCourse = await signCourseFiles(course);

    return res.status(201).json({
      success: true,
      message: "Cours créé avec succès.",
      data: signedCourse,
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* UPDATE COURSE                                                              */
/* -------------------------------------------------------------------------- */

export async function updateCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const {
      title,
      description,
      category,
      level,
      durationMinutes,
      coverUrl,
      isPublished,
    } = req.body;

    const files = getFiles(req);

    let finalCoverUrl: string | null | undefined = undefined;

    if (files.cover?.[0]) {
      finalCoverUrl = await uploadToB2(files.cover[0], "courses/covers");
    } else if (coverUrl !== undefined) {
      finalCoverUrl = coverUrl || null;
    }

    const course = await coursesService.updateCourse(courseId, userId, {
      ...(title !== undefined && {
        title: String(title).trim(),
      }),

      ...(description !== undefined && {
        description: String(description).trim(),
      }),

      ...(category !== undefined && {
        category: String(category).trim(),
      }),

      ...(level !== undefined && {
        level: String(level).trim(),
      }),

      ...(durationMinutes !== undefined && {
        durationMinutes: numberOrUndefined(durationMinutes) ?? 0,
      }),

      ...(finalCoverUrl !== undefined && {
        coverUrl: finalCoverUrl,
      }),

      ...(isPublished !== undefined && {
        isPublished: booleanOrUndefined(isPublished) ?? false,
      }),
    });

    const signedCourse = await signCourseFiles(course);

    return res.json({
      success: true,
      message: "Cours mis à jour avec succès.",
      data: signedCourse,
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE COURSE                                                              */
/* -------------------------------------------------------------------------- */

export async function deleteCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    await coursesService.deleteCourse(courseId, userId);

    return res.json({
      success: true,
      message: "Cours supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* ARTICLES                                                                   */
/* -------------------------------------------------------------------------- */

export async function getArticles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const articles = await coursesService.getArticles(
      courseId,
      userId
    );

    const signedArticles = await Promise.all(
      articles.map((article) => signArticleFiles(article))
    );

    return res.status(200).json({
      success: true,
      data: signedArticles,
    });
  } catch (error) {
    console.error("❌ getArticles error:", error);
    next(error);
  }
}

export async function createArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const {
      title,
      excerpt,
      content,
      category,
      coverUrl,
      readTimeMinutes,
      isPublished,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le titre de l'article est obligatoire.",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le contenu de l'article est obligatoire.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "La catégorie de l'article est obligatoire.",
      });
    }

const files = getFiles(req);

const uploadedFiles = [
  ...(files.articleFiles || []),
  ...(files.files || []),
  ...(files.single || []),
];

const pdfFile = uploadedFiles.find(
  (file) =>
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
);
    let pdfUrl: string | null = null;

    if (pdfFile) {
      pdfUrl = await uploadToB2(pdfFile, `courses/${courseId}/articles`);
    }

    const article = await coursesService.createArticle(courseId, userId, {
      title: title.trim(),
      excerpt: excerpt?.trim() ?? "",
      content: content.trim(),
      category: category.trim(),
      coverUrl: coverUrl || null,
      pdfUrl,
      readTimeMinutes: numberOrUndefined(readTimeMinutes) ?? 5,
      isPublished: booleanOrUndefined(isPublished) ?? false,
    });

    const signedArticle = await signArticleFiles(article);

    return res.status(201).json({
      success: true,
      message: "Article créé avec succès.",
      data: signedArticle,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const articleId = getParam(req, "contentId");

    const {
      title,
      excerpt,
      content,
      category,
      coverUrl,
      readTimeMinutes,
      isPublished,
      order,
    } = req.body;

const files = getFiles(req);

const uploadedFiles = [
  ...(files.articleFiles || []),
  ...(files.files || []),
  ...(files.single || []),
];

const pdfFile = uploadedFiles.find(
  (file) =>
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
);

    let pdfUrl: string | undefined = undefined;

    if (pdfFile) {
      pdfUrl = await uploadToB2(pdfFile, `courses/${courseId}/articles`);
    }

    const article = await coursesService.updateArticle(
      courseId,
      articleId,
      userId,
      {
        ...(title !== undefined && {
          title: String(title).trim(),
        }),

        ...(excerpt !== undefined && {
          excerpt: String(excerpt).trim(),
        }),

        ...(content !== undefined && {
          content: String(content),
        }),

        ...(category !== undefined && {
          category: String(category).trim(),
        }),

        ...(coverUrl !== undefined && {
          coverUrl: coverUrl || null,
        }),

        ...(pdfUrl !== undefined && {
          pdfUrl,
        }),

        ...(readTimeMinutes !== undefined && {
          readTimeMinutes: numberOrUndefined(readTimeMinutes) ?? 5,
        }),

        ...(isPublished !== undefined && {
          isPublished: booleanOrUndefined(isPublished) ?? false,
        }),

        ...(order !== undefined && {
          order: numberOrUndefined(order) ?? 0,
        }),
      }
    );

    const signedArticle = await signArticleFiles(article);

    return res.json({
      success: true,
      message: "Article mis à jour avec succès.",
      data: signedArticle,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const articleId = getParam(req, "contentId");

    await coursesService.deleteArticle(courseId, articleId, userId);

    return res.json({
      success: true,
      message: "Article supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* VIDEOS                                                                     */
/* -------------------------------------------------------------------------- */

export async function getVideos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const videos = await coursesService.getVideos(courseId, userId);

    const signedVideos = await Promise.all(videos.map(signVideoFiles));

    return res.json({
      success: true,
      data: signedVideos,
    });
  } catch (error) {
    next(error);
  }
}

export async function getVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const videoId = getParam(req, "contentId");

    const video = await coursesService.getVideo(courseId, videoId, userId);

    const signedVideo = await signVideoFiles(video);

    return res.json({
      success: true,
      data: signedVideo,
    });
  } catch (error) {
    next(error);
  }
}

export async function createVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const {
      title,
      description,
      durationSeconds,
      thumbnailUrl,
      videoUrl,
      category,
      isPublished,
    } = req.body;


    const files = getFiles(req);
    const uploadedVideo = files.videoFile?.[0];
    const uploadedThumbnail = files.thumbnail?.[0];

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le titre de la vidéo est obligatoire.",
      });
    }

    let finalVideoUrl: string | null = videoUrl || null;

    if (uploadedVideo) {
      finalVideoUrl = await uploadToB2(
        uploadedVideo,
        `courses/${courseId}/videos`
      );
    }

    let finalThumbnailUrl: string | null = thumbnailUrl || null;

    if (uploadedThumbnail) {
      finalThumbnailUrl = await uploadToB2(
        uploadedThumbnail,
        `courses/${courseId}/videos/thumbnails`
      );
    }

    const video = await coursesService.createVideo(courseId, userId, {
      title: title.trim(),
      description: description?.trim() ?? "",
      durationSeconds: numberOrUndefined(durationSeconds) ?? 0,
      thumbnailUrl: finalThumbnailUrl,
      videoUrl: finalVideoUrl,
      category: category?.trim() || undefined,
      isPublished: booleanOrUndefined(isPublished) ?? false,
    });

    const signedVideo = await signVideoFiles(video);

    return res.status(201).json({
      success: true,
      message: "Vidéo créée avec succès.",
      data: signedVideo,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const videoId = getParam(req, "contentId");

    const {
      title,
      description,
      durationSeconds,
      thumbnailUrl,
      videoUrl,
      category,
      isPublished,
      order,
    } = req.body;


    const files = getFiles(req);
    const uploadedVideo = files.videoFile?.[0];
    const uploadedThumbnail = files.thumbnail?.[0];

    let finalVideoUrl: string | undefined = undefined;

    if (uploadedVideo) {
      finalVideoUrl = await uploadToB2(
        uploadedVideo,
        `courses/${courseId}/videos`
      );
    } else if (videoUrl !== undefined) {
      finalVideoUrl = videoUrl || null;
    }

    let finalThumbnailUrl: string | undefined = undefined;

    if (uploadedThumbnail) {
      finalThumbnailUrl = await uploadToB2(
        uploadedThumbnail,
        `courses/${courseId}/videos/thumbnails`
      );
    } else if (thumbnailUrl !== undefined) {
      finalThumbnailUrl = thumbnailUrl || null;
    }

    const video = await coursesService.updateVideo(
      courseId,
      videoId,
      userId,
      {
        ...(title !== undefined && {
          title: String(title).trim(),
        }),

        ...(description !== undefined && {
          description: String(description),
        }),

        ...(durationSeconds !== undefined && {
          durationSeconds: numberOrUndefined(durationSeconds) ?? 0,
        }),

        ...(finalThumbnailUrl !== undefined && {
          thumbnailUrl: finalThumbnailUrl,
        }),

        ...(finalVideoUrl !== undefined && {
          videoUrl: finalVideoUrl,
        }),

        ...(category !== undefined && {
          category: String(category).trim(),
        }),

        ...(isPublished !== undefined && {
          isPublished: booleanOrUndefined(isPublished) ?? false,
        }),

        ...(order !== undefined && {
          order: numberOrUndefined(order) ?? 0,
        }),
      }
    );

    const signedVideo = await signVideoFiles(video);

    return res.json({
      success: true,
      message: "Vidéo mise à jour avec succès.",
      data: signedVideo,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteVideo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const videoId = getParam(req, "contentId");

    await coursesService.deleteVideo(courseId, videoId, userId);

    return res.json({
      success: true,
      message: "Vidéo supprimée avec succès.",
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* RESOURCES                                                                  */
/* -------------------------------------------------------------------------- */

export async function getResources(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const resources = await coursesService.getResources(courseId, userId);

    const signedResources = await Promise.all(
      resources.map(signResourceFiles)
    );

    return res.json({
      success: true,
      data: signedResources,
    });
  } catch (error) {
    next(error);
  }
}

export async function getResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const resourceId = getParam(req, "contentId");

    const resource = await coursesService.getResource(
      courseId,
      resourceId,
      userId
    );

    const signedResource = await signResourceFiles(resource);

    return res.json({
      success: true,
      data: signedResource,
    });
  } catch (error) {
    next(error);
  }
}

export async function createResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const {
      title,
      description,
      type,
      fileUrl,
      coverUrl,
      fileSizeBytes,
      isPublished,
    } = req.body;

    const uploadedFile = req.file;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le titre de la ressource est obligatoire.",
      });
    }

    if (!type?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Le type de ressource est obligatoire.",
      });
    }

    let finalFileUrl: string | null = fileUrl || null;

    if (uploadedFile) {
      finalFileUrl = await uploadToB2(
        uploadedFile,
        `courses/${courseId}/resources`
      );
    }

    const finalFileSize = uploadedFile
      ? uploadedFile.size
      : numberOrUndefined(fileSizeBytes) ?? null;

    const resource = await coursesService.createResource(courseId, userId, {
      title: title.trim(),
      description: description?.trim() ?? "",
      type: type.trim(),
      fileUrl: finalFileUrl,
      coverUrl: coverUrl || null,
      fileSizeBytes: finalFileSize,
      isPublished: booleanOrUndefined(isPublished) ?? false,
    });

    const signedResource = await signResourceFiles(resource);

    return res.status(201).json({
      success: true,
      message: "Ressource créée avec succès.",
      data: signedResource,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const resourceId = getParam(req, "contentId");

    const {
      title,
      description,
      type,
      fileUrl,
      coverUrl,
      fileSizeBytes,
      isPublished,
      order,
    } = req.body;

    const uploadedFile = req.file;

    let finalFileUrl: string | null | undefined = undefined;

    if (uploadedFile) {
      finalFileUrl = await uploadToB2(
        uploadedFile,
        `courses/${courseId}/resources`
      );
    } else if (fileUrl !== undefined) {
      finalFileUrl = fileUrl || null;
    }

    let finalFileSize: number | null | undefined = undefined;

    if (uploadedFile) {
      finalFileSize = uploadedFile.size;
    } else if (fileSizeBytes !== undefined) {
      finalFileSize =
        fileSizeBytes === null || fileSizeBytes === ""
          ? null
          : numberOrUndefined(fileSizeBytes) ?? null;
    }

    const resource = await coursesService.updateResource(
      courseId,
      resourceId,
      userId,
      {
        ...(title !== undefined && {
          title: String(title).trim(),
        }),

        ...(description !== undefined && {
          description: String(description),
        }),

        ...(type !== undefined && {
          type: String(type).trim(),
        }),

        ...(finalFileUrl !== undefined && {
          fileUrl: finalFileUrl,
        }),

        ...(coverUrl !== undefined && {
          coverUrl: coverUrl || null,
        }),

        ...(finalFileSize !== undefined && {
          fileSizeBytes: finalFileSize,
        }),

        ...(isPublished !== undefined && {
          isPublished: booleanOrUndefined(isPublished) ?? false,
        }),

        ...(order !== undefined && {
          order: numberOrUndefined(order) ?? 0,
        }),
      }
    );

    const signedResource = await signResourceFiles(resource);

    return res.json({
      success: true,
      message: "Ressource mise à jour avec succès.",
      data: signedResource,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteResource(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const resourceId = getParam(req, "contentId");

    await coursesService.deleteResource(courseId, resourceId, userId);

    return res.json({
      success: true,
      message: "Ressource supprimée avec succès.",
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* LESSON                                                                     */
/* -------------------------------------------------------------------------- */

export async function getLesson(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = getParam(req, "id");
    const lessonId = getParam(req, "lessonId");

    const lesson = await coursesService.getPublishedLesson(
      courseId,
      lessonId
    );

    const result = serialize(lesson);

    if (result.type === "video") {
      result.data = await signVideoFiles(result.data);
    }

    if (result.type === "article") {
      result.data = await signArticleFiles(result.data);
    }

    if (result.type === "resource") {
      result.data = await signResourceFiles(result.data);
    }

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
export async function getArticle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");
    const articleId = getParam(req, "contentId");

    const article = await coursesService.getArticle(courseId, articleId, userId);
    const signedArticle = await signArticleFiles(article);

    return res.json({
      success: true,
      data: signedArticle,
    });
  } catch (error) {
    next(error);
  }
}
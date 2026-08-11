import { Request, Response, NextFunction } from "express";
import * as coursesService from "../services/courses.service";

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

    const serializedCourses = JSON.parse(
      JSON.stringify(courses, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.status(200).json({
      success: true,
      data: serializedCourses,
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

    const serializedCourses = JSON.parse(
      JSON.stringify(courses, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.json({
      success: true,
      data: serializedCourses,
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
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const course = await coursesService.getCourseById(
      courseId,
      userId
    );

    const serializedCourse = JSON.parse(
      JSON.stringify(course, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.json({
      success: true,
      data: serializedCourse,
    });
  } catch (error) {
    next(error);
  }
}

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

    const course = await coursesService.createCourse(userId, {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level: level.trim(),
      durationMinutes:
        numberOrUndefined(durationMinutes) ?? 0,
      coverUrl: coverUrl || null,
      isPublished:
        booleanOrUndefined(isPublished) ?? false,
    });

    return res.status(201).json({
      success: true,
      message: "Cours créé avec succès.",
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

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

    const course = await coursesService.updateCourse(
      courseId,
      userId,
      {
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
          durationMinutes:
            numberOrUndefined(durationMinutes) ?? 0,
        }),

        ...(coverUrl !== undefined && {
          coverUrl: coverUrl || null,
        }),

        ...(isPublished !== undefined && {
          isPublished:
            booleanOrUndefined(isPublished) ?? false,
        }),
      }
    );

    return res.json({
      success: true,
      message: "Cours mis à jour avec succès.",
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCourse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    await coursesService.deleteCourse(
      courseId,
      userId
    );

    return res.json({
      success: true,
      message: "Cours supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                   */
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

    const serializedArticles = JSON.parse(
      JSON.stringify(articles, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.json({
      success: true,
      data: serializedArticles,
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

    const article = await coursesService.getArticle(
      courseId,
      articleId,
      userId
    );

    return res.json({
      success: true,
      data: article,
    });
  } catch (error) {
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
        message:
          "Le titre de l'article est obligatoire.",
      });
    }

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Le contenu de l'article est obligatoire.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "La catégorie de l'article est obligatoire.",
      });
    }

    /*
     * Route:
     *
     * upload.array("files", 10)
     *
     * Therefore req.files is an array.
     */

    const uploadedFiles = Array.isArray(req.files)
      ? req.files
      : [];

    /*
     * Find the PDF among uploaded files.
     */

    const pdfFile = uploadedFiles.find(
      (file) =>
        file.mimetype === "application/pdf" ||
        file.originalname
          .toLowerCase()
          .endsWith(".pdf")
    );

    const pdfUrl = pdfFile
      ? `/uploads/courses/${pdfFile.filename}`
      : null;

    const article =
      await coursesService.createArticle(
        courseId,
        userId,
        {
          title: title.trim(),
          excerpt: excerpt?.trim() ?? "",
          content: content.trim(),
          category: category.trim(),
          coverUrl: coverUrl || null,
          pdfUrl,
          readTimeMinutes:
            numberOrUndefined(readTimeMinutes) ?? 5,
          isPublished:
            booleanOrUndefined(isPublished) ?? false,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Article créé avec succès.",
      data: article,
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

    /*
     * If a new PDF is uploaded, use it.
     */

    const uploadedFiles = Array.isArray(req.files)
      ? req.files
      : [];

    const pdfFile = uploadedFiles.find(
      (file) =>
        file.mimetype === "application/pdf" ||
        file.originalname
          .toLowerCase()
          .endsWith(".pdf")
    );

    const pdfUrl = pdfFile
      ? `/uploads/courses/${pdfFile.filename}`
      : undefined;

    const article =
      await coursesService.updateArticle(
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
            readTimeMinutes:
              numberOrUndefined(readTimeMinutes) ?? 5,
          }),

          ...(isPublished !== undefined && {
            isPublished:
              booleanOrUndefined(isPublished) ?? false,
          }),

          ...(order !== undefined && {
            order:
              numberOrUndefined(order) ?? 0,
          }),
        }
      );

    return res.json({
      success: true,
      message:
        "Article mis à jour avec succès.",
      data: article,
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

    await coursesService.deleteArticle(
      courseId,
      articleId,
      userId
    );

    return res.json({
      success: true,
      message:
        "Article supprimé avec succès.",
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Videos                                                                     */
/* -------------------------------------------------------------------------- */

export async function getVideos(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const videos = await coursesService.getVideos(
      courseId,
      userId
    );

    return res.json({
      success: true,
      data: videos,
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

    const video = await coursesService.getVideo(
      courseId,
      videoId,
      userId
    );

    return res.json({
      success: true,
      data: video,
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

    const uploadedVideo = req.file;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Le titre de la vidéo est obligatoire.",
      });
    }

    const finalVideoUrl = uploadedVideo
      ? `/uploads/courses/${uploadedVideo.filename}`
      : videoUrl || null;

    const video =
      await coursesService.createVideo(
        courseId,
        userId,
        {
          title: title.trim(),
          description:
            description?.trim() ?? "",
          durationSeconds:
            numberOrUndefined(
              durationSeconds
            ) ?? 0,
          thumbnailUrl:
            thumbnailUrl || null,
          videoUrl: finalVideoUrl,
          category:
            category?.trim() || undefined,
          isPublished:
            booleanOrUndefined(
              isPublished
            ) ?? false,
        }
      );

    return res.status(201).json({
      success: true,
      message: "Vidéo créée avec succès.",
      data: video,
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

    const uploadedVideo = req.file;

    const finalVideoUrl =
      uploadedVideo
        ? `/uploads/courses/${uploadedVideo.filename}`
        : videoUrl !== undefined
          ? videoUrl || null
          : undefined;

    const video =
      await coursesService.updateVideo(
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
            durationSeconds:
              numberOrUndefined(
                durationSeconds
              ) ?? 0,
          }),

          ...(thumbnailUrl !== undefined && {
            thumbnailUrl:
              thumbnailUrl || null,
          }),

          ...(finalVideoUrl !== undefined && {
            videoUrl: finalVideoUrl,
          }),

          ...(category !== undefined && {
            category:
              String(category).trim(),
          }),

          ...(isPublished !== undefined && {
            isPublished:
              booleanOrUndefined(
                isPublished
              ) ?? false,
          }),

          ...(order !== undefined && {
            order:
              numberOrUndefined(order) ?? 0,
          }),
        }
      );

    return res.json({
      success: true,
      message:
        "Vidéo mise à jour avec succès.",
      data: video,
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

    await coursesService.deleteVideo(
      courseId,
      videoId,
      userId
    );

    return res.json({
      success: true,
      message:
        "Vidéo supprimée avec succès.",
    });
  } catch (error) {
    next(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Resources                                                                  */
/* -------------------------------------------------------------------------- */

export async function getResources(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = getUserId(req);
    const courseId = getParam(req, "id");

    const resources =
      await coursesService.getResources(
        courseId,
        userId
      );

    const serializedResources = JSON.parse(
      JSON.stringify(resources, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.json({
      success: true,
      data: serializedResources,
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
    const resourceId =
      getParam(req, "contentId");

    const resource =
      await coursesService.getResource(
        courseId,
        resourceId,
        userId
      );

    const serializedResource = JSON.parse(
      JSON.stringify(resource, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.json({
      success: true,
      data: serializedResource,
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
        message:
          "Le titre de la ressource est obligatoire.",
      });
    }

    if (!type?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Le type de ressource est obligatoire.",
      });
    }

    const finalFileUrl = uploadedFile
      ? `/uploads/courses/${uploadedFile.filename}`
      : fileUrl || null;

    const finalFileSize =
      uploadedFile
        ? uploadedFile.size
        : numberOrUndefined(
            fileSizeBytes
          ) ?? null;

    const resource =
      await coursesService.createResource(
        courseId,
        userId,
        {
          title: title.trim(),
          description:
            description?.trim() ?? "",
          type: type.trim(),
          fileUrl: finalFileUrl,
          coverUrl: coverUrl || null,
          fileSizeBytes:
            finalFileSize,
          isPublished:
            booleanOrUndefined(
              isPublished
            ) ?? false,
        }
      );

    const serializedResource = JSON.parse(
      JSON.stringify(resource, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.status(201).json({
      success: true,
      message:
        "Ressource créée avec succès.",
      data: serializedResource,
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
    const resourceId =
      getParam(req, "contentId");

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

    const finalFileUrl =
      uploadedFile
        ? `/uploads/courses/${uploadedFile.filename}`
        : fileUrl !== undefined
          ? fileUrl || null
          : undefined;

    const finalFileSize =
      uploadedFile
        ? uploadedFile.size
        : fileSizeBytes !== undefined
          ? fileSizeBytes === null ||
            fileSizeBytes === ""
            ? null
            : numberOrUndefined(
                fileSizeBytes
              ) ?? null
          : undefined;

    const resource =
      await coursesService.updateResource(
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
            fileSizeBytes:
              finalFileSize === null
                ? null
                : Number(finalFileSize),
          }),

          ...(isPublished !== undefined && {
            isPublished:
              booleanOrUndefined(
                isPublished
              ) ?? false,
          }),

          ...(order !== undefined && {
            order:
              numberOrUndefined(order) ?? 0,
          }),
        }
      );

    const serializedResource = JSON.parse(
      JSON.stringify(resource, (_key, value) =>
        typeof value === "bigint" ? Number(value) : value
      )
    );

    return res.json({
      success: true,
      message:
        "Ressource mise à jour avec succès.",
      data: serializedResource,
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
    const resourceId =
      getParam(req, "contentId");

    await coursesService.deleteResource(
      courseId,
      resourceId,
      userId
    );

    return res.json({
      success: true,
      message:
        "Ressource supprimée avec succès.",
    });
  } catch (error) {
    next(error);
  }
}
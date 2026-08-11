import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  getMyCourses,
  getPublishedCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,

  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,

  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,

  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
} from "../controllers/courses.controller";

import { verifyToken } from "../middleware/auth";
import { expertOnly } from "../middleware/rbac";

const router = Router();

/* ============================================================
   UPLOAD CONFIGURATION
============================================================ */

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "courses"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const baseName = path.basename(
      file.originalname,
      extension
    );

    const safeName = baseName
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    cb(
      null,
      `${Date.now()}-${safeName}${extension}`
    );
  },
});

/*
 * Allowed files:
 *
 * PDF
 * Images
 * Videos
 * DOC / DOCX
 * XLS / XLSX
 * PPT / PPTX
 * ZIP
 */

const allowedMimeTypes = [
  // PDF
  "application/pdf",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",

  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // ZIP
  "application/zip",
  "application/x-zip-compressed",
];

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },

  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        `Type de fichier non autorisé: ${file.mimetype}`
      )
    );
  },
});

/* ============================================================
   PUBLIC COURSES
============================================================ */

/*
 * GET /api/courses/public
 *
 * Publicly visible published courses.
 */

router.get(
  "/public",
  getPublishedCourses
);

/* ============================================================
   EXPERT COURSES
============================================================ */

/*
 * IMPORTANT:
 *
 * /expert MUST COME BEFORE /:id
 *
 * Otherwise:
 *
 * GET /api/courses/expert
 *
 * would become:
 *
 * GET /api/courses/:id
 *
 * with:
 *
 * id = "expert"
 */

/*
 * GET /api/courses/expert
 *
 * Get all courses belonging to the
 * currently authenticated expert.
 */

router.get(
  "/expert",
  verifyToken,
  expertOnly,
  getMyCourses
);

/*
 * GET /api/courses
 *
 * Alias for the expert's courses.
 */

router.get(
  "/",
  verifyToken,
  expertOnly,
  getMyCourses
);

/* ============================================================
   CREATE COURSE
============================================================ */

/*
 * POST /api/courses
 *
 * Multipart form:
 *
 * cover
 * resourceFiles[]
 * articleFiles[]
 * videoFiles[]
 */

router.post(
  "/",
  verifyToken,
  expertOnly,
  upload.fields([
    {
      name: "cover",
      maxCount: 1,
    },

    {
      name: "resourceFiles",
      maxCount: 50,
    },

    {
      name: "articleFiles",
      maxCount: 50,
    },

    {
      name: "videoFiles",
      maxCount: 20,
    },
  ]),
  createCourse
);

/* ============================================================
   SINGLE COURSE
============================================================ */

/*
 * GET /api/courses/:id
 *
 * Get one course.
 *
 * This MUST remain AFTER /expert.
 */

router.get(
  "/:id",
  verifyToken,
  expertOnly,
  getCourse
);

/*
 * PUT /api/courses/:id
 *
 * Update a course.
 */

router.put(
  "/:id",
  verifyToken,
  expertOnly,
  upload.fields([
    {
      name: "cover",
      maxCount: 1,
    },

    {
      name: "resourceFiles",
      maxCount: 50,
    },

    {
      name: "articleFiles",
      maxCount: 50,
    },

    {
      name: "videoFiles",
      maxCount: 20,
    },
  ]),
  updateCourse
);

/*
 * DELETE /api/courses/:id
 */

router.delete(
  "/:id",
  verifyToken,
  expertOnly,
  deleteCourse
);

/* ============================================================
   ARTICLES
============================================================ */

/*
 * GET /api/courses/:id/articles
 */

router.get(
  "/:id/articles",
  verifyToken,
  expertOnly,
  getArticles
);

/*
 * POST /api/courses/:id/articles
 *
 * Supports article attachments such as PDF.
 *
 * Frontend field:
 *
 * files[]
 */

router.post(
  "/:id/articles",
  verifyToken,
  expertOnly,
  upload.array("files", 10),
  createArticle
);

/*
 * GET /api/courses/:id/articles/:contentId
 */

router.get(
  "/:id/articles/:contentId",
  verifyToken,
  expertOnly,
  getArticle
);

/*
 * PUT /api/courses/:id/articles/:contentId
 *
 * Supports replacing/adding article files.
 */

router.put(
  "/:id/articles/:contentId",
  verifyToken,
  expertOnly,
  upload.array("files", 10),
  updateArticle
);

/*
 * DELETE /api/courses/:id/articles/:contentId
 */

router.delete(
  "/:id/articles/:contentId",
  verifyToken,
  expertOnly,
  deleteArticle
);

/* ============================================================
   VIDEOS
============================================================ */

/*
 * GET /api/courses/:id/videos
 */

router.get(
  "/:id/videos",
  verifyToken,
  expertOnly,
  getVideos
);

/*
 * POST /api/courses/:id/videos
 *
 * Video upload field:
 *
 * videoFile
 */

router.post(
  "/:id/videos",
  verifyToken,
  expertOnly,
  upload.single("videoFile"),
  createVideo
);

/*
 * GET /api/courses/:id/videos/:contentId
 */

router.get(
  "/:id/videos/:contentId",
  verifyToken,
  expertOnly,
  getVideo
);

/*
 * PUT /api/courses/:id/videos/:contentId
 *
 * Allows replacing the video.
 */

router.put(
  "/:id/videos/:contentId",
  verifyToken,
  expertOnly,
  upload.single("videoFile"),
  updateVideo
);

/*
 * DELETE /api/courses/:id/videos/:contentId
 */

router.delete(
  "/:id/videos/:contentId",
  verifyToken,
  expertOnly,
  deleteVideo
);

/* ============================================================
   RESOURCES
============================================================ */

/*
 * GET /api/courses/:id/resources
 */

router.get(
  "/:id/resources",
  verifyToken,
  expertOnly,
  getResources
);

/*
 * POST /api/courses/:id/resources
 *
 * Resource upload field:
 *
 * file
 *
 * Supports:
 * PDF
 * DOCX
 * XLSX
 * PPTX
 * ZIP
 * etc.
 */

router.post(
  "/:id/resources",
  verifyToken,
  expertOnly,
  upload.single("file"),
  createResource
);

/*
 * GET /api/courses/:id/resources/:contentId
 */

router.get(
  "/:id/resources/:contentId",
  verifyToken,
  expertOnly,
  getResource
);

/*
 * PUT /api/courses/:id/resources/:contentId
 *
 * Allows replacing the resource file.
 */

router.put(
  "/:id/resources/:contentId",
  verifyToken,
  expertOnly,
  upload.single("file"),
  updateResource
);

/*
 * DELETE /api/courses/:id/resources/:contentId
 */

router.delete(
  "/:id/resources/:contentId",
  verifyToken,
  expertOnly,
  deleteResource
);

/* ============================================================
   EXPORT
============================================================ */

export default router;
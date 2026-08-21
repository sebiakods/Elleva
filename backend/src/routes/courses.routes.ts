import { Router } from "express";
import multer from "multer";

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

  getLesson,
} from "../controllers/courses.controller";

import { verifyToken } from "../middleware/auth";
import { expertOnly } from "../middleware/rbac";

const router = Router();

/* ============================================================
   UPLOAD CONFIGURATION
   ============================================================

   Files are kept in memory temporarily.

   The controllers will upload them to Backblaze B2.
   We do NOT use diskStorage() anymore.

============================================================ */

const storage = multer.memoryStorage();

/*
 * Allowed files:
 *
 * PDF
 * Images
 * Videos
 * DOC/DOCX
 * XLS/XLSX
 * PPT/PPTX
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
    // 100 MB maximum per uploaded file
    fileSize: 100 * 1024 * 1024,
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
   EXPERT: MY COURSES

   IMPORTANT:
   /expert MUST come before /:id

   Otherwise:
   GET /api/courses/expert

   could be interpreted as:
   GET /api/courses/:id
   with id = "expert".
============================================================ */

router.get(
  "/expert",
  verifyToken,
  expertOnly,
  getMyCourses
);

/* ============================================================
   PUBLIC / USER CATALOG

   Any authenticated user can list published courses.

   No payment logic here.
   No enrollment logic here.
============================================================ */

router.get(
  "/",
  verifyToken,
  getPublishedCourses
);

/* ============================================================
   CREATE COURSE

   Expert only.

   Files:
   - cover
   - resourceFiles
   - articleFiles
   - videoFiles

   Files are stored in memory and will be uploaded to B2
   by the controller/service.
============================================================ */

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

   Expert:
   - Can access own course
   - Published or unpublished

   Other users:
   - Published courses only

   Payment/enrollment gating remains separate.
============================================================ */

router.get(
  "/:id",
  verifyToken,
  getCourse
);

/* ============================================================
   UPDATE COURSE
============================================================ */

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

/* ============================================================
   DELETE COURSE
============================================================ */

router.delete(
  "/:id",
  verifyToken,
  expertOnly,
  deleteCourse
);

/* ============================================================
   ARTICLES
   Expert only — content management
============================================================ */

router.get(
  "/:id/articles",
  verifyToken,
  expertOnly,
  getArticles
);

router.post(
  "/:id/articles",
  verifyToken,
  expertOnly,
  upload.array("files", 10),
  createArticle
);

router.get(
  "/:id/articles/:contentId",
  verifyToken,
  expertOnly,
  getArticle
);

router.put(
  "/:id/articles/:contentId",
  verifyToken,
  expertOnly,
  upload.array("files", 10),
  updateArticle
);

router.delete(
  "/:id/articles/:contentId",
  verifyToken,
  expertOnly,
  deleteArticle
);

/* ============================================================
   VIDEOS
   Expert only — content management
============================================================ */

router.get(
  "/:id/videos",
  verifyToken,
  expertOnly,
  getVideos
);

router.post(
  "/:id/videos",
  verifyToken,
  expertOnly,
  upload.single("videoFile"),
  createVideo
);

router.get(
  "/:id/videos/:contentId",
  verifyToken,
  expertOnly,
  getVideo
);

router.put(
  "/:id/videos/:contentId",
  verifyToken,
  expertOnly,
  upload.single("videoFile"),
  updateVideo
);

router.delete(
  "/:id/videos/:contentId",
  verifyToken,
  expertOnly,
  deleteVideo
);

/* ============================================================
   RESOURCES
   Expert only — content management
============================================================ */

router.get(
  "/:id/resources",
  verifyToken,
  expertOnly,
  getResources
);

router.post(
  "/:id/resources",
  verifyToken,
  expertOnly,
  upload.single("file"),
  createResource
);

router.get(
  "/:id/resources/:contentId",
  verifyToken,
  expertOnly,
  getResource
);

router.put(
  "/:id/resources/:contentId",
  verifyToken,
  expertOnly,
  upload.single("file"),
  updateResource
);

router.delete(
  "/:id/resources/:contentId",
  verifyToken,
  expertOnly,
  deleteResource
);

/* ============================================================
   LESSON

   Unified article/video/resource lookup for learners.

   Any authenticated user viewing a published course.
============================================================ */

router.get(
  "/:id/lesson/:lessonId",
  verifyToken,
  getLesson
);

/* ============================================================
   EXPORT
============================================================ */

export default router;
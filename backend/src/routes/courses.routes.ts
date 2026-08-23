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
   VIDEO UPLOAD FIELDS

   A video creation/update needs the main video file AND,
   optionally, a thumbnail image. upload.single() only ever
   accepts one field name, so any second file (or any field
   name other than the one it was given) triggers multer's
   "Unexpected field" error. upload.fields([...]) accepts a
   named SET of fields instead.

   NOTE: this populates req.files as an object keyed by field
   name (each value is an array), NOT req.file like
   upload.single() does — the controller must be updated to
   match (see courses.controller.ts).
============================================================ */

const videoUpload = upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

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
  upload.single("pdfFile"),
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
  upload.single("pdfFile"),
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

   videoUpload = upload.fields([videoFile, thumbnail])
   (see definition above). Controller must read
   req.files.videoFile?.[0] and req.files.thumbnail?.[0]
   instead of req.file.
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
  videoUpload,
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
  videoUpload,
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
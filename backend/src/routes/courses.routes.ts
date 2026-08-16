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

  getLesson,
} from "../controllers/courses.controller";

import { verifyToken } from "../middleware/auth";
import { expertOnly } from "../middleware/rbac";

const router = Router();

/* ============================================================
   UPLOAD CONFIGURATION
============================================================ */

const uploadDir = path.join(process.cwd(), "uploads", "courses");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);

    const safeName = baseName
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-");

    cb(null, `${Date.now()}-${safeName}${extension}`);
  },
});

/*
 * Allowed files:
 * PDF, Images, Videos, DOC/DOCX, XLS/XLSX, PPT/PPTX, ZIP
 */
const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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

    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
  },
});

/* ============================================================
   EXPERT: MY COURSES
   IMPORTANT: /expert MUST come before /:id, otherwise
   GET /api/courses/expert would be captured by GET /api/courses/:id
   with id = "expert".
============================================================ */

router.get("/expert", verifyToken, expertOnly, getMyCourses);

/* ============================================================
   PUBLIC/USER CATALOG
   Any authenticated user (entrepreneur, expert, admin, etc.)
   can list published courses. NO payment logic, NO enrollment logic.
============================================================ */

router.get("/", verifyToken, getPublishedCourses);

/* ============================================================
   CREATE COURSE (expert only)
============================================================ */

router.post(
  "/",
  verifyToken,
  expertOnly,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "resourceFiles", maxCount: 50 },
    { name: "articleFiles", maxCount: 50 },
    { name: "videoFiles", maxCount: 20 },
  ]),
  createCourse
);

/* ============================================================
   SINGLE COURSE
   Open to any authenticated user. The controller decides:
   - expert -> owned course (any publish state)
   - everyone else -> published course only
   Payment gating is handled entirely on the frontend.
   This MUST remain AFTER /expert.
============================================================ */

router.get("/:id", verifyToken, getCourse);

/*
 * PUT /api/courses/:id
 */
router.put(
  "/:id",
  verifyToken,
  expertOnly,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "resourceFiles", maxCount: 50 },
    { name: "articleFiles", maxCount: 50 },
    { name: "videoFiles", maxCount: 20 },
  ]),
  updateCourse
);

/*
 * DELETE /api/courses/:id
 */
router.delete("/:id", verifyToken, expertOnly, deleteCourse);

/* ============================================================
   ARTICLES (expert only — content management)
============================================================ */

router.get("/:id/articles", verifyToken, expertOnly, getArticles);

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
   VIDEOS (expert only — content management)
============================================================ */

router.get("/:id/videos", verifyToken, expertOnly, getVideos);

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
   RESOURCES (expert only — content management)
============================================================ */

router.get("/:id/resources", verifyToken, expertOnly, getResources);

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
   LESSON (unified article/video/resource lookup for learners)
   Open to any authenticated user viewing a published course.
============================================================ */

router.get("/:id/lesson/:lessonId", verifyToken, getLesson);

/* ============================================================
   EXPORT
============================================================ */

export default router;
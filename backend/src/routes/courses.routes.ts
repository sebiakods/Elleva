import { Router } from "express";
import {
  createCourse,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courses.controller";

import { verifyToken } from "../middleware/auth";
import upload from "../middleware/upload";

const router = Router();

/**
 * Create a new course
 * POST /api/courses
 */
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "courseFile", maxCount: 1 },
  ]),
  createCourse
);

/**
 * Get all courses of the logged-in expert
 * GET /api/courses/me
 */
router.get("/me", verifyToken, getMyCourses);

/**
 * Get one course
 * GET /api/courses/:id
 */
router.get("/:id", verifyToken, getCourseById);

/**
 * Update course
 * PUT /api/courses/:id
 */
router.put(
  "/:id",
  verifyToken,
  upload.single("cover"),
  updateCourse
);

/**
 * Delete course
 * DELETE /api/courses/:id
 */
router.delete("/:id", verifyToken, deleteCourse);

export default router;
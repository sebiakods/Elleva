import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import * as coursesService from "../services/courses.service";

/**
 * POST /api/courses
 */
export async function createCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const course = await coursesService.createCourse(req);

    res.status(201).json({
      success: true,
      message: "Course created successfully.",
      data: course,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to create course.",
    });
  }
}

/**
 * GET /api/courses/me
 */
export async function getMyCourses(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const courses = await coursesService.getMyCourses(req.user!.id);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to load courses.",
    });
  }
}

/**
 * GET /api/courses/:id
 */
export async function getCourseById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    const course = await coursesService.getCourseById(
      id,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error(error);

    res.status(404).json({
      success: false,
      message: error.message || "Course not found.",
    });
  }
}

/**
 * PUT /api/courses/:id
 */
export async function updateCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    const course = await coursesService.updateCourse(
      id,
      req.user!.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      data: course,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to update course.",
    });
  }
}

/**
 * DELETE /api/courses/:id
 */
export async function deleteCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    await coursesService.deleteCourse(
      id,
      req.user!.id
    );

    res.status(200).json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to delete course.",
    });
  }
}
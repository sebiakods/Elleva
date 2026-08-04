import { prisma } from "../prisma";
import { AuthenticatedRequest } from "../types";

/**
 * Create Course
 */
export async function createCourse(req: AuthenticatedRequest) {
  const {
    title,
    description,
    category,
    level,
    durationMinutes,
  } = req.body;

  if (!title || !description || !category || !level) {
    throw new Error("Missing required fields.");
  }

  const expert = await prisma.expertProfile.findUnique({
    where: {
      userId: req.user!.id,
    },
  });

  if (!expert) {
    throw new Error("Expert profile not found.");
  }

  const slug = `course-${Date.now()}`;
const files = req.files as {
  cover?: Express.Multer.File[];
  courseFile?: Express.Multer.File[];
};

const coverUrl = files?.cover?.[0]
  ? `/uploads/${files.cover[0].filename}`
  : null;
return prisma.course.create({
  data: {
    title,
    slug,
    description,
    category,
    level,
    durationMinutes: Number(durationMinutes),

    coverUrl,

    lessonCount: 0,
    enrolledCount: 0,
    rating: 0,
    isPublished: true,
    expertProfileId: expert.id,
  },
});
  
}





/**
 * Get all courses of the logged-in expert
 */
export async function getMyCourses(userId: string) {
  const expert = await prisma.expertProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!expert) {
    throw new Error("Expert profile not found.");
  }

  return prisma.course.findMany({
    where: {
      expertProfileId: expert.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Get one course
 */
export async function getCourseById(
  courseId: string,
  userId: string
) {
  const expert = await prisma.expertProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!expert) {
    throw new Error("Expert profile not found.");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      expertProfileId: expert.id,
    },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  return course;
}

/**
 * Update course
 */
export async function updateCourse(
  courseId: string,
  userId: string,
  data: any
) {
  const expert = await prisma.expertProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!expert) {
    throw new Error("Expert profile not found.");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      expertProfileId: expert.id,
    },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  return prisma.course.update({
    where: {
      id: courseId,
    },
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      durationMinutes:
        data.durationMinutes !== undefined
          ? Number(data.durationMinutes)
          : course.durationMinutes,
      isPublished:
        data.isPublished !== undefined
          ? data.isPublished
          : course.isPublished,
    },
  });
}

/**
 * Delete course
 */
export async function deleteCourse(
  courseId: string,
  userId: string
) {
  const expert = await prisma.expertProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!expert) {
    throw new Error("Expert profile not found.");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      expertProfileId: expert.id,
    },
  });

  if (!course) {
    throw new Error("Course not found.");
  }

  await prisma.course.delete({
    where: {
      id: courseId,
    },
  });

  return {
    message: "Course deleted successfully.",
  };
}
import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const experts = await prisma.expertProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            bio: true,
            isVerified: true,
            isActive: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("EXPERTS FOUND:", experts.length);

    experts.forEach((expert) => {
      console.log({
        expertProfileId: expert.id,
        userId: expert.user?.id,
        name: expert.user?.name,
        email: expert.user?.email,
        role: expert.user?.role,
        isActive: expert.user?.isActive,
      });
    });

    res.json(experts);
  } catch (error) {
    console.error("GET /experts error:", error);

    res.status(500).json({
      message: "Impossible de récupérer les expertes",
    });
  }
});



export default router;
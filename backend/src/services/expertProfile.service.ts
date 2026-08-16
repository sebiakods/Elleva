// backend/src/services/expertProfile.service.ts
import { prisma } from "../prisma";

export const expertProfileService = {
  async getByUserId(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        expertProfile: true,
      },
    });
    return user;
  },

  async update(
    userId: string,
    userData: Partial<{ name: string; bio: string; avatarUrl: string }>,
    expertData: Partial<{
      title: string;
      specialties: string[];
      sessionRateDA: number;
      availableForBooking: boolean;
      linkedinUrl: string;
      websiteUrl: string;
    }>
  ) {
    return prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id: userId }, data: userData });
      }

      const expertProfile = await tx.expertProfile.update({
        where: { userId },
        data: expertData,
      });

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, bio: true, avatarUrl: true },
      });

      return { ...user, expertProfile };
    });
  },
};
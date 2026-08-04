import prisma from "../config/database";
import { Language } from "@prisma/client";

// ─── Get user profile ─────────────────────────────────────────────────────────
export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      language: true,
      avatarUrl: true,
      bio: true,
      isVerified: true,
      createdAt: true,

      expertProfile: {
        select: {
          id: true,
          title: true,
          specialties: true,
          sessionRateDA: true,
          availableForBooking: true,
          linkedinUrl: true,
          websiteUrl: true,
          rating: true,
          reviewCount: true,
          sessionCount: true,
          isApprovedByAdmin: true,
        },
      },

      institutionProfile: {
        select: {
          id: true,
          institutionName: true,
          type: true,
          city: true,
          websiteUrl: true,
          contactEmail: true,
          contactPhone: true,
          logoUrl: true,
          isVerified: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}


// ─── Update profile ───────────────────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    bio?: string;
    language?: Language;
    avatarUrl?: string;
  }
) {
  return prisma.user.update({
    where: { id: userId },

    data,

    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      language: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });
}


// ─── Admin: list all users ────────────────────────────────────────────────────
export async function listUsers(params: {
  skip: number;
  limit: number;
  role?: string;
  search?: string;
}) {
  const where = {
    ...(params.role ? { role: params.role as any } : {}),

    ...(params.search
      ? {
          OR: [
            {
              name: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };


  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);


  return {
    users,
    total,
  };
}


// ─── Admin: toggle active ─────────────────────────────────────────────────────
export async function setUserActive(
  userId: string,
  isActive: boolean
) {
  return prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      isActive,
    },

    select: {
      id: true,
      isActive: true,
    },
  });
}

// ─── Admin: get one user ──────────────────────────────────────────────────────
export async function getUserById(id:string){

  const user = await prisma.user.findUnique({

    where:{
      id
    },


    select:{

      id:true,
      name:true,
      email:true,
      role:true,
      isActive:true,
      isVerified:true,
      avatarUrl:true,
      bio:true,
      language:true,
      createdAt:true,


      expertProfile:{

        select:{

          title:true,
          specialties:true,
          experience:true,
          languages:true,
          certifications:true,
          rating:true,
          reviewCount:true,
          sessionCount:true,

        }

      },



      institutionProfile:{

        select:{

          institutionName:true,
          type:true,
          city:true,
          websiteUrl:true,
          isVerified:true,

        }

      },


    }

  });



  if(!user)
    throw new Error("USER_NOT_FOUND");



  return user;

}
// ─── Admin: delete user ───────────────────────────────────────────────────────
export async function deleteUser(userId: string) {
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
    },
  });

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    id: userId,
    deleted: true,
  };
}
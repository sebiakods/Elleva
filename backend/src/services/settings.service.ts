import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import bcrypt from "bcryptjs";

/* =========================================================
   TYPES
========================================================= */

export type PersonalSettings = {
  id: string;
  email: string;
  name: string;
  language: string;
  bio: string | null;
  avatarUrl: string | null;
  role: string;

  expertProfile?: {
    title: string;
    specialties: string[];
    sessionRateDA: number;
    availableForBooking: boolean;
    linkedinUrl: string | null;
    websiteUrl: string | null;
  } | null;

  institutionProfile?: {
    institutionName: string;
    type: string;
    city: string;
    websiteUrl: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    logoUrl: string | null;
  } | null;
};

export type UpdatePersonalSettings = {
  name?: string;
  language?: "AR" | "FR" | "EN";
  bio?: string | null;
  avatarUrl?: string | null;

  expert?: {
    title?: string;
    sessionRateDA?: number;
    availableForBooking?: boolean;
    linkedinUrl?: string | null;
    websiteUrl?: string | null;
  };

  institution?: {
    institutionName?: string;
    city?: string;
    websiteUrl?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    logoUrl?: string | null;
  };
};

/* =========================================================
   PERSONAL SETTINGS
========================================================= */

export async function getMySettings(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      email: true,
      name: true,
      language: true,
      bio: true,
      avatarUrl: true,
      role: true,

      expertProfile: {
        select: {
          title: true,
          specialties: true,
          sessionRateDA: true,
          availableForBooking: true,
          linkedinUrl: true,
          websiteUrl: true,
        },
      },

      institutionProfile: {
        select: {
          institutionName: true,
          type: true,
          city: true,
          websiteUrl: true,
          contactEmail: true,
          contactPhone: true,
          logoUrl: true,
        },
      },
    },
  });
}

export async function updateMySettings(
  userId: string,
  data: UpdatePersonalSettings
) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: userId,
      },

      data: {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),

        ...(data.language !== undefined && {
          language: data.language,
        }),

        ...(data.bio !== undefined && {
          bio: data.bio,
        }),

        ...(data.avatarUrl !== undefined && {
          avatarUrl: data.avatarUrl,
        }),
      },
    });

    /* -----------------------------------------------------
       EXPERT PROFILE
    ----------------------------------------------------- */

    if (data.expert) {
      await tx.expertProfile.updateMany({
        where: {
          userId,
        },

        data: {
          ...(data.expert.title !== undefined && {
            title: data.expert.title.trim(),
          }),

          ...(data.expert.sessionRateDA !== undefined && {
            sessionRateDA: data.expert.sessionRateDA,
          }),

          ...(data.expert.availableForBooking !== undefined && {
            availableForBooking: data.expert.availableForBooking,
          }),

          ...(data.expert.linkedinUrl !== undefined && {
            linkedinUrl: data.expert.linkedinUrl,
          }),

          ...(data.expert.websiteUrl !== undefined && {
            websiteUrl: data.expert.websiteUrl,
          }),
        },
      });
    }

    /* -----------------------------------------------------
       INSTITUTION PROFILE
    ----------------------------------------------------- */

    if (data.institution) {
      await tx.institutionProfile.updateMany({
        where: {
          userId,
        },

        data: {
          ...(data.institution.institutionName !== undefined && {
            institutionName:
              data.institution.institutionName.trim(),
          }),

          ...(data.institution.city !== undefined && {
            city: data.institution.city.trim(),
          }),

          ...(data.institution.websiteUrl !== undefined && {
            websiteUrl: data.institution.websiteUrl,
          }),

          ...(data.institution.contactEmail !== undefined && {
            contactEmail: data.institution.contactEmail,
          }),

          ...(data.institution.contactPhone !== undefined && {
            contactPhone: data.institution.contactPhone,
          }),

          ...(data.institution.logoUrl !== undefined && {
            logoUrl: data.institution.logoUrl,
          }),
        },
      });
    }

    return tx.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        name: true,
        language: true,
        bio: true,
        avatarUrl: true,
        role: true,

        expertProfile: {
          select: {
            title: true,
            specialties: true,
            sessionRateDA: true,
            availableForBooking: true,
            linkedinUrl: true,
            websiteUrl: true,
          },
        },

        institutionProfile: {
          select: {
            institutionName: true,
            type: true,
            city: true,
            websiteUrl: true,
            contactEmail: true,
            contactPhone: true,
            logoUrl: true,
          },
        },
      },
    });
  });
}

/* =========================================================
   PASSWORD
========================================================= */

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  if (!currentPassword || !newPassword) {
    throw new Error("CURRENT_AND_NEW_PASSWORD_REQUIRED");
  }

  if (newPassword.length < 8) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      passwordHash: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const valid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  );

  if (!valid) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      passwordHash,
    },
  });

  return {
    success: true,
  };
}

/* =========================================================
   NOTIFICATION SETTINGS
========================================================= */

function notificationKey(userId: string) {
  return `user-settings:${userId}:notifications`;
}

const DEFAULT_NOTIFICATIONS = {
  email: true,
  financing: true,
  messages: true,
  applications: true,
  reports: false,
};

export async function getNotificationSettings(userId: string) {
  const setting = await prisma.systemSetting.findUnique({
    where: {
      key: notificationKey(userId),
    },
  });

  return {
    ...DEFAULT_NOTIFICATIONS,
    ...((setting?.value as Record<string, boolean> | undefined) ?? {}),
  };
}

export async function updateNotificationSettings(
  userId: string,
  preferences: Record<string, boolean>
) {
  const safePreferences: Record<string, boolean> = {
    ...DEFAULT_NOTIFICATIONS,
  };

  for (const key of Object.keys(DEFAULT_NOTIFICATIONS)) {
    if (typeof preferences[key] === "boolean") {
      safePreferences[key] = preferences[key];
    }
  }

  return prisma.systemSetting.upsert({
    where: {
      key: notificationKey(userId),
    },

    create: {
      key: notificationKey(userId),
      value: safePreferences as Prisma.InputJsonValue,
    },

    update: {
      value: safePreferences as Prisma.InputJsonValue,
    },
  });
}

/* =========================================================
   ADMIN SYSTEM SETTINGS
========================================================= */

export async function getSystemSettings() {
  return prisma.systemSetting.findMany({
    where: {
      NOT: {
        key: {
          startsWith: "user-settings:",
        },
      },
    },

    orderBy: {
      key: "asc",
    },
  });
}

export async function updateSystemSettings(
  settings: Array<{
    key: string;
    value: Prisma.InputJsonValue;
  }>
) {
  return prisma.$transaction(
    settings.map(({ key, value }) =>
      prisma.systemSetting.upsert({
        where: {
          key,
        },

        create: {
          key,
          value,
        },

        update: {
          value,
        },
      })
    )
  );
}
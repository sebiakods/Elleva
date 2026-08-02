import prisma from "../config/database";
import { NotificationType } from "../types";

export async function listNotifications(
  userId: string,
  params: { skip: number; limit: number; unreadOnly?: boolean }
) {
  const where = {
    userId,
    ...(params.unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, unreadCount };
}

export async function markAsRead(id: string, userId: string) {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif)               throw new Error("NOT_FOUND");
  if (notif.userId !== userId) throw new Error("FORBIDDEN");

  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
}

export async function markAllAsRead(userId: string) {
  const { count } = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { updated: count };
}

export async function deleteNotification(id: string, userId: string) {
  const notif = await prisma.notification.findUnique({ where: { id } });
  if (!notif)               throw new Error("NOT_FOUND");
  if (notif.userId !== userId) throw new Error("FORBIDDEN");
  await prisma.notification.delete({ where: { id } });
}

// ─── Internal helper — called from other services ─────────────────────────────
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({ data });
}
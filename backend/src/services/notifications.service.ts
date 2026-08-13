import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
}

/**
 * Create one notification for one user.
 */
export async function createNotification(
  data: CreateNotificationInput
) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      link: data.link ?? null,
    },
  });
}

/**
 * Get notifications belonging ONLY to the authenticated user.
 */
export async function getNotifications(
  userId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
  }
) {
  const limit = Math.min(
    Math.max(options?.limit ?? 50, 1),
    100
  );

  return prisma.notification.findMany({
    where: {
      userId,

      ...(options?.unreadOnly
        ? {
            isRead: false,
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },

    take: limit,
  });
}

/**
 * Get number of unread notifications.
 */
export async function getUnreadCount(
  userId: string
) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark one notification as read.
 *
 * updateMany is intentional:
 * it ensures the notification belongs to the
 * authenticated user before changing it.
 */
export async function markAsRead(
  notificationId: string,
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications belonging to the user as read.
 */
export async function markAllAsRead(
  userId: string
) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

/**
 * Delete one notification belonging to the user.
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
) {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
    },
  });
}

/* =========================================================
   NOTIFICATION CREATION HELPERS
   ========================================================= */

/**
 * NEW_MESSAGE
 */
export async function notifyNewMessage(
  receiverId: string,
  senderName: string,
  conversationId: string
) {
  return createNotification({
    userId: receiverId,

    type: NotificationType.NEW_MESSAGE,

    title: "Nouveau message",

    body: `${senderName} vous a envoyé un nouveau message.`,

    link: `/messages?conversation=${conversationId}`,
  });
}

/**
 * SESSION_BOOKED
 */
export async function notifySessionBooked(
  userId: string,
  otherUserName: string,
  sessionId: string
) {
  return createNotification({
    userId,

    type: NotificationType.SESSION_BOOKED,

    title: "Séance réservée",

    body: `Une séance avec ${otherUserName} a été réservée.`,

    link: `/sessions/${sessionId}`,
  });
}

/**
 * BUSINESS_PLAN_SUBMITTED
 */
export async function notifyBusinessPlanSubmitted(
  userId: string,
  entrepreneurName: string,
  businessPlanId: string
) {
  return createNotification({
    userId,

    type: NotificationType.BUSINESS_PLAN_SUBMITTED,

    title: "Business plan soumis",

    body: `${entrepreneurName} a soumis un business plan.`,

    link: `/business-plans/${businessPlanId}`,
  });
}

/**
 * BUSINESS_PLAN_REVIEWED
 */
export async function notifyBusinessPlanReviewed(
  entrepreneurId: string,
  status: string,
  businessPlanId: string
) {
  return createNotification({
    userId: entrepreneurId,

    type: NotificationType.BUSINESS_PLAN_REVIEWED,

    title: "Business plan examiné",

    body: `Votre business plan a été ${status.toLowerCase()}.`,

    link: `/business-plans/${businessPlanId}`,
  });
}

/**
 * NEW_QUESTION
 */
export async function notifyNewQuestion(
  expertId: string,
  entrepreneurName: string,
  questionId: string
) {
  return createNotification({
    userId: expertId,

    type: NotificationType.NEW_QUESTION,

    title: "Nouvelle question",

    body: `${entrepreneurName} vous a posé une question.`,

    link: `/expert/questions/${questionId}`,
  });
}

/**
 * NEW_REVIEW
 */
export async function notifyNewReview(
  expertId: string,
  reviewerName: string,
  rating: number,
  reviewId: string
) {
  return createNotification({
    userId: expertId,

    type: NotificationType.NEW_REVIEW,

    title: "Nouvel avis",

    body: `${reviewerName} vous a laissé une note de ${rating}/5.`,

    link: `/expert/reviews/${reviewId}`,
  });
}

/**
 * APPLICATION_STATUS_CHANGED
 */
export async function notifyApplicationStatusChanged(
  entrepreneurId: string,
  programTitle: string,
  status: string,
  applicationId: string
) {
  return createNotification({
    userId: entrepreneurId,

    type: NotificationType.APPLICATION_STATUS_CHANGED,

    title: "Statut de candidature modifié",

    body: `Votre candidature pour "${programTitle}" est maintenant ${status}.`,

    link: `/applications/${applicationId}`,
  });
}

/**
 * PROGRAM_PUBLISHED
 */
export async function notifyProgramPublished(
  entrepreneurId: string,
  programTitle: string,
  programId: string
) {
  return createNotification({
    userId: entrepreneurId,

    type: NotificationType.PROGRAM_PUBLISHED,

    title: "Nouveau programme de financement",

    body: `"${programTitle}" vient d'être publié.`,

    link: `/financing/${programId}`,
  });
}

/**
 * GENERAL
 */
export async function notifyGeneral(
  userId: string,
  title: string,
  body: string,
  link?: string | null
) {
  return createNotification({
    userId,

    type: NotificationType.GENERAL,

    title,

    body,

    link: link ?? null,
  });
}
/**
 * MEETING_SCHEDULED
 */
export async function notifyMeetingScheduled(
  userId: string,
  expertName: string,
  meetingTitle: string,
  meetingId: string
) {
  return createNotification({
    userId,

    type: NotificationType.MEETING_SCHEDULED,

    title: "Nouvelle réunion",

    body: `${expertName} vous a invitée à une réunion : "${meetingTitle}".`,

    link: `/dashboard/meeting/${meetingId}`,
  });
}
/**
 * QUESTION_ANSWERED (reuses GENERAL type — no new enum value required)
 */
export async function notifyQuestionAnswered(
  askerId: string,
  expertName: string,
  questionId: string
) {
  return createNotification({
    userId: askerId,

    type: NotificationType.GENERAL,

    title: "Votre question a une réponse",

    body: `${expertName} a répondu à votre question.`,

    link: `/dashboard/qa/${questionId}`,
  });
}
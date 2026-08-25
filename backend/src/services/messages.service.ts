import { Role } from '@prisma/client';
// NOTE: adjust this import to match your existing shared Prisma client instance
// (e.g. '../lib/prisma', '../prisma/client', '../db'). A local instantiation is
// used here only as a safe fallback if no shared client is found.
import { prisma } from '../prisma';


const ALLOWED_ROLES: Record<Role, Role[]> = {
  ADMIN: ['ADMIN', 'EXPERT', 'ENTREPRENEUR', 'INSTITUTION'],
  EXPERT: ['ENTREPRENEUR', 'INSTITUTION', 'ADMIN'],
  ENTREPRENEUR: ['EXPERT', 'INSTITUTION', 'ADMIN'],
  INSTITUTION: ['ENTREPRENEUR', 'EXPERT', 'ADMIN'],
};

export class MessagingError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'MessagingError';
  }
}

export function canMessage(senderRole: Role, receiverRole: Role): boolean {
  return ALLOWED_ROLES[senderRole]?.includes(receiverRole) ?? false;
}

const USER_SUMMARY_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;


export async function getAvailableUsers(currentUserId: string, currentUserRole: Role) {
  const allowedRoles = ALLOWED_ROLES[currentUserRole] ?? [];

  const users = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      role: { in: allowedRoles },
    },
    select: USER_SUMMARY_SELECT,
    orderBy: { name: 'asc' },
  });

  return users;
}

/**
 * Returns the current user's conversations, each with the other participant,
 * the last message, and an unread count.
 */
export async function getConversations(currentUserId: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { id: currentUserId },
      },
    },
    include: {
      participants: {
        select: USER_SUMMARY_SELECT,
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: { select: USER_SUMMARY_SELECT },
          receiver: { select: USER_SUMMARY_SELECT },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const results = await Promise.all(
    conversations.map(async (conversation) => {
      const otherParticipant =
        conversation.participants.find((participant) => participant.id !== currentUserId) ??
        null;

      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          receiverId: currentUserId,
          isRead: false,
        },
      });

      return {
        id: conversation.id,
        updatedAt: conversation.updatedAt,
        participant: otherParticipant,
        lastMessage: conversation.messages[0] ?? null,
        unreadCount,
      };
    })
  );

  return results;
}

/**
 * Finds the conversation (if any) between two specific users.
 */
async function findConversationBetween(userAId: string, userBId: string) {
  return prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { id: userAId } } },
        { participants: { some: { id: userBId } } },
      ],
    },
  });
}

/**
 * Returns the full message history between the current user and another user,
 * ordered oldest to newest. Also marks incoming messages as read.
 * Returns an empty array if no conversation exists yet.
 */
export async function getMessagesWithUser(currentUserId: string, otherUserId: string) {
  const conversation = await findConversationBetween(currentUserId, otherUserId);

  if (!conversation) {
    return [];
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: { select: USER_SUMMARY_SELECT },
      receiver: { select: USER_SUMMARY_SELECT },
    },
  });

  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      receiverId: currentUserId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return messages;
}

/**
 * Sends a message from `senderId` to `receiverId`, creating the conversation
 * first if one does not already exist. Enforces the role-based permission
 * matrix before writing anything.
 */
export async function sendMessage(
  senderId: string,
  senderRole: Role,
  receiverId: string,
  content: string
) {
  if (senderId === receiverId) {
    throw new MessagingError('You cannot send a message to yourself', 400);
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, role: true },
  });

  if (!receiver) {
    throw new MessagingError('Receiver not found', 404);
  }

  if (!canMessage(senderRole, receiver.role)) {
    throw new MessagingError('You are not allowed to message this user', 403);
  }

  let conversation = await findConversationBetween(senderId, receiverId);

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: senderId }, { id: receiverId }],
        },
      },
    });
  } else {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      receiverId,
      content,
    },
    include: {
      sender: { select: USER_SUMMARY_SELECT },
      receiver: { select: USER_SUMMARY_SELECT },
    },
  });

  return message;
}
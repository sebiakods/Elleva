import prisma from "../config/database";

export async function getThreads(userId: string) {
  // Get all unique conversation partners
  const sent = await prisma.message.findMany({
    where: { senderId: userId },
    select: { receiverId: true },
    distinct: ["receiverId"],
  });
  const received = await prisma.message.findMany({
    where: { receiverId: userId },
    select: { senderId: true },
    distinct: ["senderId"],
  });

  const partnerIds = [
    ...new Set([
      ...sent.map((m) => m.receiverId),
      ...received.map((m) => m.senderId),
    ]),
  ].filter((id) => id !== userId);

  const threads = await Promise.all(
    partnerIds.map(async (partnerId) => {
      const partner = await prisma.user.findUnique({
        where: { id: partnerId },
        select: { id: true, name: true, avatarUrl: true, role: true },
      });

      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { content: true, createdAt: true, senderId: true },
      });

      const unreadCount = await prisma.message.count({
        where: { senderId: partnerId, receiverId: userId, isRead: false },
      });

      return { partner, lastMessage, unreadCount };
    })
  );

  return threads.sort((a, b) =>
    (b.lastMessage?.createdAt ?? 0) > (a.lastMessage?.createdAt ?? 0) ? 1 : -1
  );
}

export async function getConversation(
  userId: string,
  partnerId: string,
  params: { skip: number; limit: number }
) {
  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      skip: params.skip,
      take: params.limit,
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    }),
    prisma.message.count({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
    }),
  ]);

  // Mark received messages as read
  await prisma.message.updateMany({
    where: { senderId: partnerId, receiverId: userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return { messages: messages.reverse(), total };
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new Error("RECEIVER_NOT_FOUND");

  const message = await prisma.message.create({
    data: { senderId, receiverId, content },
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  // Create notification for receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      title: "Nouveau message",
      body: `${message.sender.name} vous a envoyé un message.`,
      link: `/dashboard/messages`,
    },
  });

  return message;
}

export async function getUnreadCount(userId: string) {
  return prisma.message.count({ where: { receiverId: userId, isRead: false } });
}
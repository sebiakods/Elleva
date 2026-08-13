import prisma from "../config/database";

export async function askQuestion(askerId: string, question: string, category: string) {
  return prisma.qAQuestion.create({
    data: { askerId, question, category },
  });
}

export async function listMyQuestions(askerId: string) {
  return prisma.qAQuestion.findMany({
    where: { askerId },
    orderBy: { createdAt: "desc" },
    include: {
      answerer: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function listAllQuestions(params: { answered?: boolean; search?: string }) {
  return prisma.qAQuestion.findMany({
    where: {
      ...(params.answered !== undefined ? { isAnswered: params.answered } : {}),
      ...(params.search
        ? { question: { contains: params.search, mode: "insensitive" } }
        : {}),
    },
    orderBy: [{ isAnswered: "asc" }, { createdAt: "desc" }],
    include: {
      asker: { select: { id: true, name: true, avatarUrl: true } },
      answerer: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function answerQuestion(id: string, answererId: string, answer: string) {
  const question = await prisma.qAQuestion.findUnique({ where: { id } });
  if (!question) throw new Error("NOT_FOUND");
  if (question.isAnswered) throw new Error("ALREADY_ANSWERED");

  return prisma.qAQuestion.update({
    where: { id },
    data: {
      answer,
      answererId,
      isAnswered: true,
      answeredAt: new Date(),
    },
    include: {
      asker: { select: { id: true, name: true } },
    },
  });
}

export async function voteQuestion(id: string) {
  const question = await prisma.qAQuestion.findUnique({ where: { id } });
  if (!question) throw new Error("NOT_FOUND");

  return prisma.qAQuestion.update({
    where: { id },
    data: { votes: { increment: 1 } },
  });
}
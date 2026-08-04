import { Request, Response } from "express";

import {
  getUsersForMessaging,
  sendMessage,
  getConversationMessages,
} from "../services/messages.service";

function getHeaderValue(
  value: string | string[] | undefined
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// ======================
// GET USERS
// ======================
export async function getMessagingUsers(
  req: Request,
  res: Response
) {
  try {
    const currentUserId = getHeaderValue(req.headers["user-id"]);

    if (!currentUserId) {
      return res.status(401).json({
        error: "Missing user id",
      });
    }

    const users = await getUsersForMessaging(currentUserId);

    return res.json(users);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed loading users",
    });
  }
}

// ======================
// SEND MESSAGE
// ======================
export async function createMessage(
  req: Request,
  res: Response
) {
  try {
    const senderId = getHeaderValue(req.headers["user-id"]);

    if (!senderId) {
      return res.status(401).json({
        error: "Missing sender id",
      });
    }

    const otherUserId = String(req.params.otherUserId);

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const message = await sendMessage(
      senderId,
      otherUserId,
      content.trim()
    );

    return res.status(201).json(message);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed sending message",
    });
  }
}

// ======================
// GET CONVERSATION
// ======================
export async function getMessages(
  req: Request,
  res: Response
) {
  try {
    const userId = getHeaderValue(req.headers["user-id"]);

    if (!userId) {
      return res.status(401).json({
        error: "Missing user id",
      });
    }

    const otherUserId = String(req.params.otherUserId);

    const messages = await getConversationMessages(
      userId,
      otherUserId
    );

    return res.json(messages);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed loading messages",
    });
  }
}
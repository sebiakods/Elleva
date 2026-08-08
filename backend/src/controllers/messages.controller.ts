import { Request, Response, NextFunction } from 'express';
import * as messagesService from '../services/messages.service';
import { MessagingError } from '../services/messages.service';

// req.user is typed globally by src/middlewares/auth.middleware.ts
// (Express.Request.user = { id, email, role, name }), so no local
// AuthenticatedRequest interface is needed here.

/**
 * GET /api/messages/users
 * Returns every user the current user is allowed to message.
 */
export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { id, role } = req.user;
    const users = await messagesService.getAvailableUsers(id, role);
    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/messages/conversations
 * Returns the current user's conversations with last message + unread count.
 */
export async function getConversations(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { id } = req.user;
    const conversations = await messagesService.getConversations(id);
    return res.status(200).json(conversations);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/messages/:userId
 * Returns the message history between the current user and :userId.
 * Returns an empty array if no conversation exists yet.
 */
export async function getConversationMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { id } = req.user;

    const userId = req.params.userId;

    // Fix TypeScript string | string[]
    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({
        message: "Invalid userId parameter",
      });
    }

    const messages = await messagesService.getMessagesWithUser(
      id,
      userId
    );

    return res.status(200).json(messages);

  } catch (error) {
    return next(error);
  }
}
/**
 * POST /api/messages
 * Body: { receiverId: string, content: string }
 * Creates the conversation if needed, validates permission, and saves the message.
 */
export async function postMessage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const { id, role } = req.user;
    const { receiverId, content } = req.body ?? {};

    if (typeof receiverId !== 'string' || receiverId.trim().length === 0) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ message: 'content is required' });
    }

    const message = await messagesService.sendMessage(id, role, receiverId, content.trim());
    return res.status(201).json(message);
  } catch (error) {
    if (error instanceof MessagingError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return next(error);
  }
}
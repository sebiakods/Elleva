import { Router } from "express";

import {
  getMessagingUsers,
  createMessage,
  getMessages,
} from "../controllers/messages.controller";

const router = Router();

// ==========================
// GET USERS
// GET /api/messages/users
// ==========================
router.get("/users", getMessagingUsers);

// ==========================
// GET CONVERSATION
// GET /api/messages/:otherUserId
// ==========================
router.get("/:otherUserId", getMessages);

// ==========================
// SEND MESSAGE
// POST /api/messages/:otherUserId
// ==========================
router.post("/:otherUserId", createMessage);

export default router;
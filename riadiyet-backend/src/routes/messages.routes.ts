import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/messages.controller";
import { verifyToken } from "../middleware/auth";
import { allRoles } from "../middleware/rbac";
import { validate } from "../middleware/validate";

const router = Router();

const sendSchema = z.object({
  receiverId: z.string().cuid("ID destinataire invalide"),
  content:    z.string().min(1, "Le message ne peut pas être vide").max(5000),
});

// All authenticated roles can message
router.get ("/",                      verifyToken, allRoles, ctrl.getThreads);
router.get ("/unread",                verifyToken, allRoles, ctrl.getUnreadCount);
router.get ("/:partnerId",            verifyToken, allRoles, ctrl.getConversation);
router.post("/",                      verifyToken, allRoles, validate(sendSchema), ctrl.sendMessage);

export default router;
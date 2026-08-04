import { Router } from "express";
import * as ctrl from "../controllers/notifications.controller";
import { verifyToken } from "../middleware/auth";
import { allRoles } from "../middleware/rbac";

const router = Router();

router.get   ("/",           verifyToken, allRoles, ctrl.listNotifications);
router.patch ("/read-all",   verifyToken, allRoles, ctrl.markAllAsRead);
router.patch ("/:id/read",   verifyToken, allRoles, ctrl.markAsRead);
router.delete("/:id",        verifyToken, allRoles, ctrl.deleteNotification);

export default router;
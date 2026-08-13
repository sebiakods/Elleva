import { Router } from "express";
import * as ctrl from "../controllers/meetings.controller";
import { verifyToken } from "../middleware/auth";
import { expertOrAdmin } from "../middleware/rbac";

const router = Router();

// Any authenticated user (expert who hosts it, or invited entrepreneur) can list/view their meetings.
router.get("/", verifyToken, ctrl.listMyMeetings);
router.get("/:id", verifyToken, ctrl.getMeeting);

// Only experts (or admins) can schedule a meeting.
router.post("/", verifyToken, expertOrAdmin, ctrl.createMeeting);

export default router;
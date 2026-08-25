import { Router } from "express";
import { Role } from "@prisma/client";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../controllers/expertCalendar.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate, authorize(Role.EXPERT));

router.get("/", getCalendarEvents);
router.post("/", createCalendarEvent);
router.patch("/:id", updateCalendarEvent);
router.delete("/:id", deleteCalendarEvent);

export default router;

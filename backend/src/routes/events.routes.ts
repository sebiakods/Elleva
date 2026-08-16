// backend/src/routes/events.routes.ts
import { Router } from "express";
import * as eventsController from "../controllers/events.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac";   // adjust to your actual path/name

const router = Router();

/* Institution-scoped (auth required, INSTITUTION role) */
router.get("/institution/events", authenticate, requireRoles("INSTITUTION"), eventsController.listInstitutionEvents);
router.post("/institution/events", authenticate, requireRoles("INSTITUTION"), eventsController.createEvent);
router.get("/institution/events/:id", authenticate, requireRoles("INSTITUTION"), eventsController.getEventById);
router.patch("/institution/events/:id", authenticate, requireRoles("INSTITUTION"), eventsController.updateEvent);
router.patch("/institution/events/:id/publish", authenticate, requireRoles("INSTITUTION"), eventsController.publishEvent);
router.delete("/institution/events/:id", authenticate, requireRoles("INSTITUTION"), eventsController.deleteEvent);

/* Public / entrepreneur-facing */
router.get("/events", eventsController.listPublicEvents);

export default router;
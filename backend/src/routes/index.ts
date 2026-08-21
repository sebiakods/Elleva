import { Router } from "express";

import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import programsRoutes from "./programs.routes";
import applicationsRoutes from "./applications.routes";
import businessPlansRoutes from "./businessPlans.routes";
import messagesRoutes from "./messages.routes";
import notificationsRoutes from "./notifications.routes";
import expertApplicationsRoutes from "./expertApplications.routes";
import institutionApplicationsRoutes from "./institutionApplications.routes";
import articlesRoutes from "./articles.routes";
import settingsRoutes from "./settings.routes";
import categoryRoutes from "./category.routes";
import coursesRoutes from "./courses.routes";
import entrepreneursRoutes from "./entrepreneurs.routes";
import calendarEventRoutes from "./expertCalendar.routes";
import meetingsRoutes from "./meetings.routes";
import qaRoutes from "./qa.routes";
import eventsRoutes from "./events.routes";
import communityRoutes from "./community.routes";
import documentsRoutes from "./documents.routes";
import analyticsRoutes from "./analytics.routes";
import overviewRoutes from "./overview.routes";
import institutionProfileRoutes from "./institutionProfile.routes";
import expertProfileRoutes from "./expertProfile.routes";
import expertsRoutes from "./experts.routes";
console.log("DEBUG expertsRoutes:", expertsRoutes);
console.log("DEBUG expertsRoutes type:", typeof expertsRoutes);
const router = Router();

/* ========================================================================= */
/* AUTHENTICATION                                                            */
/* ========================================================================= */

router.use("/auth", authRoutes);

/* ========================================================================= */
/* EXPERT APPLICATIONS — source of truth for expert signup/approval         */
/* ========================================================================= */

router.use("/expert-applications", expertApplicationsRoutes);

/* ========================================================================= */
/* INSTITUTION APPLICATIONS — source of truth for institution signup/approval */
/* ========================================================================= */

router.use("/institution-applications", institutionApplicationsRoutes);

/*
 * NOTE: the AccountRequest model/controller/routes (`/account-requests`)
 * are deprecated in favor of ExpertApplication / InstitutionApplication
 * above and are intentionally not mounted here. Once you've confirmed
 * nothing else reads from AccountRequest, it's safe to delete
 * accountRequests.controller.ts, accountRequests.routes.ts, and drop the
 * AccountRequest model via a Prisma migration.
 */

/* ========================================================================= */
/* USERS                                                                     */
/* ========================================================================= */

router.use("/users", usersRoutes);

/* ========================================================================= */
/* CATEGORIES                                                                */
/* ========================================================================= */

router.use("/categories", categoryRoutes);

/* ========================================================================= */
/* COURSES                                                                   */
/* ========================================================================= */

router.use("/courses", coursesRoutes);

/* ========================================================================= */
/* ARTICLES                                                                  */
/* ========================================================================= */

router.use("/articles", articlesRoutes);

/* ========================================================================= */
/* PROGRAMS                                                                  */
/* ========================================================================= */

router.use("/", programsRoutes);

/* ========================================================================= */
/* FINANCING APPLICATIONS                                                    */
/* ========================================================================= */

router.use("/applications", applicationsRoutes);

/* ========================================================================= */
/* BUSINESS PLANS                                                            */
/* ========================================================================= */

router.use("/business-plans", businessPlansRoutes);

/* ========================================================================= */
/* MESSAGES                                                                  */
/* ========================================================================= */

router.use("/messages", messagesRoutes);

/* ========================================================================= */
/* NOTIFICATIONS                                                             */
/* ========================================================================= */

router.use("/notifications", notificationsRoutes);

/* ========================================================================= */
/* SETTINGS                                                                  */
/* ========================================================================= */

router.use("/settings", settingsRoutes);

/* ========================================================================= */
/* HEALTH CHECK                                                              */
/* ========================================================================= */

// meetings
router.use("/meetings", meetingsRoutes);

// events
router.use("/", eventsRoutes);

router.use("/expert/calendar", calendarEventRoutes);

router.use("/expert/entrepreneurs", entrepreneursRoutes);

// Q&A
router.use("/qa", qaRoutes);
// community
router.use("/", communityRoutes);
// document
router.use("/documents", documentsRoutes);

// analytics
router.use("/", analyticsRoutes);

// overview
router.use("/", overviewRoutes);
// institution profile
router.use("/institution-profile", institutionProfileRoutes);

// expert profile
router.use("/expert-profile", expertProfileRoutes);
//expert routes 
router.use("/experts", expertsRoutes);

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? "development",
    },
  });
});

export default router;
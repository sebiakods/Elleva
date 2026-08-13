import { Router } from "express";

import authRoutes from "./auth.routes";
import accountRequestsRoutes from "./accountRequests.routes";
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

const router = Router();

/* ========================================================================= */
/* AUTHENTICATION                                                            */
/* ========================================================================= */

router.use("/auth", authRoutes);

/* ========================================================================= */
/* ACCOUNT REQUESTS                                                          */
/* ========================================================================= */

router.use("/account-requests", accountRequestsRoutes);

/* ========================================================================= */
/* EXPERT APPLICATIONS                                                       */
/* ========================================================================= */

router.use("/expert-applications", expertApplicationsRoutes);

/* ========================================================================= */
/* INSTITUTION APPLICATIONS                                                  */
/* ========================================================================= */

router.use("/institution-applications", institutionApplicationsRoutes);

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


router.use("/expert/calendar", calendarEventRoutes);

router.use("/expert/entrepreneurs", entrepreneursRoutes);

// Q&A
router.use("/qa", qaRoutes);

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
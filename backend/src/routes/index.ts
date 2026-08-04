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

const router = Router();

/* ===========================
   Authentication
=========================== */
router.use("/auth", authRoutes);

/* ===========================
   Account Requests
=========================== */
router.use("/account-requests", accountRequestsRoutes);

/* ===========================
   Expert Applications
=========================== */
router.use("/expert-applications", expertApplicationsRoutes);

/* ===========================
   Institution Applications
=========================== */
router.use("/institution-applications", institutionApplicationsRoutes);

/* ===========================
   Users
=========================== */
router.use("/users", usersRoutes);

/* ===========================
   Programs
=========================== */
router.use("/programs", programsRoutes);

/* ===========================
   Articles
=========================== */
router.use("/articles", articlesRoutes);

/* ===========================
   Financing Applications
=========================== */
router.use("/applications", applicationsRoutes);

/* ===========================
   Business Plans
=========================== */
router.use("/business-plans", businessPlansRoutes);

/* ===========================
   Messages
=========================== */
router.use("/messages", messagesRoutes);

/* ===========================
   Notifications
=========================== */
router.use("/notifications", notificationsRoutes);

/* ===========================
   Health Check
=========================== */
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


import categoryRoutes from "./category.routes";

router.use("/categories", categoryRoutes);

export default router;

import coursesRoutes from "./courses.routes";

router.use("/courses", coursesRoutes);
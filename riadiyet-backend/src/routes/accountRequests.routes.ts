import { Router } from "express";

import {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
} from "../controllers/accountRequests.controller";


const router = Router();



// Create expert/institution request
router.post(
  "/",
  createRequest
);



// Admin get all requests
router.get(
  "/",
  getRequests
);



// Admin get request details
router.get(
  "/:id",
  getRequestById
);



// Admin approve
router.patch(
  "/:id/approve",
  approveRequest
);



// Admin reject
router.patch(
  "/:id/reject",
  rejectRequest
);



export default router;
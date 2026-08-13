import { Router } from "express";
import * as ctrl from "../controllers/entrepreneurs.controller";
import { verifyToken } from "../middleware/auth";
import { expertOrAdmin } from "../middleware/rbac";

const router = Router();

router.get("/", verifyToken, expertOrAdmin, ctrl.listMyEntrepreneurs);

export default router;
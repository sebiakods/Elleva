// backend/src/routes/documents.routes.ts
import { Router } from "express";
import { documentsController } from "../controllers/documents.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac";
import { uploadDocument } from "../middleware/upload";

const router = Router();

router.get("/", authenticate, documentsController.list);
router.get("/:id", authenticate, documentsController.getOne);
router.post(
  "/",
  authenticate,
  requireRoles("INSTITUTION"),
  uploadDocument.single("file"),
  documentsController.create
);
router.patch("/:id", authenticate, requireRoles("INSTITUTION"), documentsController.update);
router.delete("/:id", authenticate, requireRoles("INSTITUTION"), documentsController.remove);
router.post("/:id/download", authenticate, documentsController.download);

export default router;
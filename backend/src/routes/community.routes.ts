import { Router } from "express";
import * as communityController from "../controllers/community.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/community/posts", authenticate, communityController.listPosts);
router.post("/community/posts", authenticate, communityController.createPost);
router.delete("/community/posts/:id", authenticate, communityController.deletePost);
router.post("/community/posts/:id/like", authenticate, communityController.toggleLike);
router.get("/community/posts/:id/comments", authenticate, communityController.listComments);
router.post("/community/posts/:id/comments", authenticate, communityController.addComment);

export default router;
import { Router } from "express";
import { z } from "zod";
import * as ctrl from "../controllers/qa.controller";
import { verifyToken } from "../middleware/auth";
import { entrepreneurOnly, expertOrAdmin } from "../middleware/rbac";
import { validate } from "../middleware/validate";

const router = Router();

const askSchema = z.object({
  question: z.string().min(10).max(1000),
  category: z.string().min(2).max(60),
});

const answerSchema = z.object({
  answer: z.string().min(5).max(3000),
});

// Entrepreneur: ask + view own questions
router.post("/", verifyToken, entrepreneurOnly, validate(askSchema), ctrl.askQuestion);
router.get("/mine", verifyToken, entrepreneurOnly, ctrl.listMyQuestions);

// Expert/Admin: browse + answer
router.get("/", verifyToken, expertOrAdmin, ctrl.listAllQuestions);
router.patch("/:id/answer", verifyToken, expertOrAdmin, validate(answerSchema), ctrl.answerQuestion);

// Any authenticated user can upvote
router.post("/:id/vote", verifyToken, ctrl.voteQuestion);

export default router;
import { Router } from "express";
import * as articlesController from "../controllers/articles.controller";
import { verifyToken } from "../middleware/auth";

const router = Router();


router.get("/", articlesController.getPublishedArticles);
router.get("/all", articlesController.getAllArticles);
router.get("/:slug", articlesController.getArticleBySlug);


router.post(
  "/",
  verifyToken,
  articlesController.createArticle
);

export default router;
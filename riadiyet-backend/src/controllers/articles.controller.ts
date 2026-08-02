import { Request, Response } from "express";
import * as articlesService from "../services/articles.service";
import { AuthenticatedRequest } from "../types";

export async function createArticle(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      title,
      slug,
      category,
      excerpt,
      content,
      readTimeMinutes,
      isPublished,
    } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const article = await articlesService.createArticle({
      expertUserId: String(req.user.id),

      title: String(title),
      slug: String(slug),
      category: String(category),
      excerpt: String(excerpt),
      content: String(content),
      readTimeMinutes: Number(readTimeMinutes),
      isPublished: Boolean(isPublished),
    });

    return res.status(201).json(article);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

export async function getAllArticles(
  req: Request,
  res: Response
) {
  try {
    const articles = await articlesService.getAllArticles();

    return res.json(articles);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function getPublishedArticles(
  req: Request,
  res: Response
) {
  try {
    const articles = await articlesService.getPublishedArticles();

    return res.json(articles);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function getArticleBySlug(
  req: Request,
  res: Response
) {
  try {
    const slug = String(req.params.slug);

    const article = await articlesService.getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    return res.json(article);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
}
import { Request, Response, NextFunction } from "express";
import * as communityService from "../services/community.service";

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const cursor = req.query.cursor as string | undefined;
    const data = await communityService.listPosts(userId, cursor);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const post = await communityService.createPost(userId, req.body.content, req.body.imageUrl);
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const result = await communityService.deletePost(userId, String(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function toggleLike(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const result = await communityService.toggleLike(userId, String(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const comments = await communityService.listComments(String(req.params.id));
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const comment = await communityService.addComment(userId, String(req.params.id), req.body.content);
    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
}
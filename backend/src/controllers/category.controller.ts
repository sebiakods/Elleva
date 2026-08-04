import { Request, Response } from "express";
import { prisma } from "../prisma";

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch categories." });
  }
}

export async function getCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: String(id) },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found.",
      });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category." });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const category = await prisma.category.create({
      data: req.body,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category." });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const category = await prisma.category.update({
      where: { id: String(id) },
      data: req.body,
    });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Failed to update category." });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.category.delete({
      where: { id: String(id) },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete category." });
  }
}
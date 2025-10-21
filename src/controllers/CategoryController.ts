import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import CategoryService from "../services/CategoryService.js";

export default class CategoryController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const { name } = req.body;
      const category = await CategoryService.create(req.userId!, name);
      return res.status(201).json(category);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const categories = await CategoryService.list(req.userId!);
      return res.json(categories);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const updated = await CategoryService.update(req.userId!, Number(id), name);
      return res.json(updated);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await CategoryService.delete(req.userId!, Number(id));
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

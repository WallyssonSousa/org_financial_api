import type { Response } from "express";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import TransactionService from "../services/TransactionService.js";

export default class TransactionController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const result = await TransactionService.create(req.userId!, req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async list(req: AuthRequest, res: Response) {
    try {
      const { filtro } = req.query; // "semana" | "mes" | "tres-meses"
      const result = await TransactionService.list(req.userId!, filtro as string);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }


  static async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await TransactionService.update(req.userId!, Number(id), req.body);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await TransactionService.delete(req.userId!, Number(id));
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}

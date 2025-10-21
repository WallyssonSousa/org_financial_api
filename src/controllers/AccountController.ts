import { Request, Response } from "express"
import AccountService from "../services/AccountService"

const accountService = new AccountService()

interface AuthenticatedRequest extends Request {
  userId?: number
}

export class AccountController {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!
      const accounts = await accountService.listAccounts(userId)
      return res.json(accounts)
    } catch (error: any) {
      return res.status(500).json({ message: error.message })
    }
  }

  async get(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!
      const id = Number(req.params.id)
      const account = await accountService.getAccountById(id, userId)
      if (!account) return res.status(404).json({ message: "Conta não encontrada" })
      return res.json(account)
    } catch (error: any) {
      return res.status(500).json({ message: error.message })
    }
  }

  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!
      const { name, balance, description } = req.body
      const account = await accountService.createAccount({ name, balance, description, userId })
      return res.status(201).json(account)
    } catch (error: any) {
      return res.status(500).json({ message: error.message })
    }
  }

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!
      const id = Number(req.params.id)
      const { name, balance, description } = req.body
      const account = await accountService.updateAccount(id, userId, { name, balance, description })
      return res.json(account)
    } catch (error: any) {
      return res.status(500).json({ message: error.message })
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId!
      const id = Number(req.params.id)
      await accountService.deleteAccount(id, userId)
      return res.status(204).send()
    } catch (error: any) {
      return res.status(500).json({ message: error.message })
    }
  }
}

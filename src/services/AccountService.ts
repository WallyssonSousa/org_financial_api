import prisma from "../config/prisma";

export default class AccountService {
  async listAccounts(userId: number) {
    return prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }

  async getAccountById(id: number, userId: number) {
    return prisma.account.findFirst({
      where: { id, userId },
    })
  }

  async createAccount(data: { name: string; balance?: number; description?: string; userId: number }) {
    return prisma.account.create({
      data,
    })
  }

  async updateAccount(id: number, userId: number, data: { name?: string; balance?: number; description?: string }) {
    const account = await prisma.account.findFirst({ where: { id, userId } })
    if (!account) throw new Error("Conta não encontrada")

    return prisma.account.update({
      where: { id },
      data,
    })
  }

  async deleteAccount(id: number, userId: number) {
    const account = await prisma.account.findFirst({ where: { id, userId } })
    if (!account) throw new Error("Conta não encontrada")

    return prisma.account.delete({ where: { id } })
  }
}
import prisma from "../config/prisma.js";

export default class TransactionService {
  static async create(usuarioId: number, data: any) {
    const { descricao, valor, tipo, metodoPagamento, categoria, fixa } = data;

    if (!descricao || !valor || !tipo) {
      throw new Error("Campos obrigatórios ausentes.");
    }

    const transaction = await prisma.transaction.create({
      data: {
        descricao,
        valor: parseFloat(valor),
        tipo,
        metodoPagamento,
        categoria,
        fixa: Boolean(fixa),
        usuarioId,
      },
    });

    return transaction;
  }

  static async listByUser(usuarioId: number) {
    return prisma.transaction.findMany({
      where: { usuarioId },
      orderBy: { data: "desc" },
    });
  }

  static async getById(usuarioId: number, id: number) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, usuarioId },
    });
    if (!transaction) throw new Error("Transação não encontrada.");
    return transaction;
  }

  static async update(usuarioId: number, id: number, data: any) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, usuarioId },
    });
    if (!transaction) throw new Error("Transação não encontrada.");

    return prisma.transaction.update({
      where: { id },
      data,
    });
  }

  static async delete(usuarioId: number, id: number) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, usuarioId },
    });
    if (!transaction) throw new Error("Transação não encontrada.");

    await prisma.transaction.delete({ where: { id } });
    return { message: "Transação removida com sucesso." };
  }

  static async summary(usuarioId: number) {
    const transactions = await prisma.transaction.findMany({ where: { usuarioId } });

    const totalEntradas = transactions
      .filter((t: { tipo: string; }) => t.tipo === "entrada")
      .reduce((sum: any, t: { valor: any; }) => sum + t.valor, 0);

    const totalSaidas = transactions
      .filter((t: { tipo: string; }) => t.tipo === "saida")
      .reduce((sum: any, t: { valor: any; }) => sum + t.valor, 0);

    const saldo = totalEntradas - totalSaidas;

    return {
      totalEntradas,
      totalSaidas,
      saldo,
    };
  }
}

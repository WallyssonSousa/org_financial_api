import prisma from "../config/prisma";

export default class CategoryService {
  static async create(userId: number, name: string) {
    if (!name) throw new Error("O nome da categoria é obrigatório.");

    const exists = await prisma.category.findFirst({
      where: { name, userId },
    });

    if (exists) throw new Error("Já existe uma categoria com esse nome.");

    const category = await prisma.category.create({
      data: { name, userId },
    });

    return category;
  }

  static async list(userId: number) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  }

  static async update(userId: number, id: number, name: string) {
    const category = await prisma.category.findFirst({ where: { id, userId } });
    if (!category) throw new Error("Categoria não encontrada.");

    return prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  static async delete(userId: number, id: number) {
    const category = await prisma.category.findFirst({ where: { id, userId } });
    if (!category) throw new Error("Categoria não encontrada.");

    await prisma.category.delete({ where: { id } });
    return { message: "Categoria removida com sucesso." };
  }
}

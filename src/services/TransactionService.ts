import prisma from "../config/prisma.js"

export default class TransactionService {
  static async create(usuarioId: number, data: any) {
    const {
      descricao,
      valor,
      tipo,
      metodoPagamento,
      categoriaId,
      contaId,
      fixa,
      parcelas,
    } = data

    if (!descricao || !valor || !tipo || !contaId) {
      throw new Error(
        "Campos obrigatórios ausentes (descrição, valor, tipo e conta são necessários)."
      )
    }

    const valorNumerico = parseFloat(valor)
    if (isNaN(valorNumerico)) throw new Error("Valor inválido.")

    const conta = await prisma.account.findFirst({
      where: { id: Number(contaId), userId: usuarioId },
    })
    if (!conta) throw new Error("Conta não encontrada.")

    if (categoriaId) {
      const categoria = await prisma.category.findFirst({
        where: { id: Number(categoriaId), userId: usuarioId },
      })

      if (!categoria) {
        const categorias = await prisma.category.findMany({
          where: { userId: usuarioId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })

        throw new Error(
          `Categoria não encontrada. Categorias existentes: ${categorias
            .map((c: { id: any; name: any }) => `${c.id} - ${c.name}`)
            .join(", ")}`
        )
      }
    }

    if (tipo === "saida" && metodoPagamento !== "credito") {
      if (conta.balance < valorNumerico) {
        throw new Error(
          `Saldo insuficiente. Saldo atual: R$${conta.balance.toFixed(
            2
          )}, valor da transação: R$${valorNumerico.toFixed(2)}`
        )
      }
    }

    if (metodoPagamento === "credito" && parcelas && parcelas > 1) {
      const qtdParcelas = Number(parcelas)
      const valorParcela = valorNumerico / qtdParcelas
      const dataAtual = new Date()

      const transacaoPai = await prisma.transaction.create({
        data: {
          descricao,
          valor: valorNumerico,
          tipo,
          metodoPagamento,
          categoriaId: categoriaId ? Number(categoriaId) : null,
          fixa: Boolean(fixa),
          usuarioId,
          contaId,
          parcelas: qtdParcelas,
        },
      })

      for (let i = 1; i <= qtdParcelas; i++) {
        const dataParcela = new Date(dataAtual)
        dataParcela.setMonth(dataParcela.getMonth() + i - 1)

        await prisma.transaction.create({
          data: {
            descricao: `${descricao} (Parcela ${i}/${qtdParcelas})`,
            valor: valorParcela,
            tipo,
            metodoPagamento,
            categoriaId: categoriaId ? Number(categoriaId) : null,
            fixa: Boolean(fixa),
            usuarioId,
            contaId,
            parcelas: qtdParcelas,
            parcelaAtual: i,
            dataFatura: dataParcela,
            transacaoPaiId: transacaoPai.id,
          },
        })
      }

      return transacaoPai
    }

    const transaction = await prisma.transaction.create({
      data: {
        descricao,
        valor: valorNumerico,
        tipo,
        metodoPagamento,
        categoriaId: categoriaId ? Number(categoriaId) : null,
        fixa: Boolean(fixa),
        usuarioId,
        contaId,
      },
    })

    if (metodoPagamento !== "credito") {
      await prisma.account.update({
        where: { id: contaId },
        data: {
          balance: {
            increment: tipo === "entrada" ? valorNumerico : -valorNumerico,
          },
        },
      })
    }

    return transaction


  }

  static async update(usuarioId: number, id: number, data: any) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, usuarioId },
    })
    if (!transaction) throw new Error("Transação não encontrada.")

    const valorAntigo = transaction.valor
    const tipoAntigo = transaction.tipo
    const contaAntiga = transaction.contaId

    const valorNovo = data.valor ? parseFloat(data.valor) : valorAntigo
    const tipoNovo = data.tipo || tipoAntigo
    const contaNova = data.contaId || contaAntiga

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        valor: valorNovo,
        contaId: contaNova,
      },
    })

    if (transaction.metodoPagamento !== "credito") {
      if (contaAntiga !== contaNova) {
        await prisma.account.update({
          where: { id: contaAntiga! },
          data: {
            balance: {
              increment: tipoAntigo === "entrada" ? -valorAntigo : valorAntigo,
            },
          },
        })
        await prisma.account.update({
          where: { id: contaNova! },
          data: {
            balance: {
              increment: tipoNovo === "entrada" ? valorNovo : -valorNovo,
            },
          },
        })
      } else {
        const diff =
          (tipoAntigo === "entrada" ? -valorAntigo : valorAntigo) +
          (tipoNovo === "entrada" ? valorNovo : -valorNovo)
        await prisma.account.update({
          where: { id: contaNova! },
          data: { balance: { increment: diff } },
        })
      }
    }

    return updated


  }

  static async delete(usuarioId: number, id: number) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, usuarioId },
    })
    if (!transaction) throw new Error("Transação não encontrada.")

    if (transaction.metodoPagamento !== "credito") {
      await prisma.account.update({
        where: { id: transaction.contaId! },
        data: {
          balance: {
            increment:
              transaction.tipo === "entrada"
                ? -transaction.valor
                : transaction.valor,
          },
        },
      })
    }

    await prisma.transaction.delete({ where: { id } })
    return { message: "Transação removida e saldo atualizado." }


  }

  static async list(usuarioId: number, filtro: string | undefined) {
    const hoje = new Date()
    let dataInicio: Date | undefined

    switch (filtro) {
      case "semana":
        dataInicio = new Date()
        dataInicio.setDate(hoje.getDate() - 7)
        break
      case "mes":
        dataInicio = new Date()
        dataInicio.setMonth(hoje.getMonth() - 1)
        break
      case "tres-meses":
        dataInicio = new Date()
        dataInicio.setMonth(hoje.getMonth() - 3)
        break
    }

    const where: any = { usuarioId }
    if (dataInicio) where.data = { gte: dataInicio }

    const transacoes = await prisma.transaction.findMany({
      where,
      orderBy: { data: "desc" },
      include: {
        categoria: true,
        conta: true,
      },
    })

    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()

    const transacoesMesAtual = transacoes.filter((t: any) => {
      const dataRef = t.dataFatura ? new Date(t.dataFatura) : new Date(t.data)
      return (
        dataRef.getMonth() === mesAtual && dataRef.getFullYear() === anoAtual
      )
    })

    const totalEntrada = transacoesMesAtual
      .filter((t: { tipo: string }) => t.tipo === "entrada")
      .reduce((acc: any, t: { valor: any }) => acc + t.valor, 0)
    const totalSaida = transacoesMesAtual
      .filter((t: { tipo: string }) => t.tipo === "saida")
      .reduce((acc: any, t: { valor: any }) => acc + t.valor, 0)

    return {
      totalEntrada,
      totalSaida,
      saldoFinal: totalEntrada - totalSaida,
      transacoes: transacoesMesAtual,
    }
  }
}
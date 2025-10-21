-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "dataFatura" TIMESTAMP(3),
ADD COLUMN     "parcelaAtual" INTEGER,
ADD COLUMN     "parcelas" INTEGER,
ADD COLUMN     "transacaoPaiId" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_transacaoPaiId_fkey" FOREIGN KEY ("transacaoPaiId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

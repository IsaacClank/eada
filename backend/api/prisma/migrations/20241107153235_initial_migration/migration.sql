-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('Expense', 'Income');

-- CreateTable
CREATE TABLE "budget" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "normalized_name" VARCHAR(60) NOT NULL,
    "income" MONEY NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "normalized Name" VARCHAR(60) NOT NULL,
    "percentange_of_income" DECIMAL(4,2) NOT NULL,
    "budget_id" TEXT,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "budget_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "normalized_name" VARCHAR(60) NOT NULL,
    "info" JSONB,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_tag_to_transaction" (
    "tag_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "_tag_to_transaction_pkey" PRIMARY KEY ("tag_id","transaction_id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "amount" MONEY NOT NULL,
    "notes" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "normalized_email" VARCHAR(100) NOT NULL,
    "encrypted_password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "budget_user_id_normalized_name_key" ON "budget"("user_id", "normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "budget_category_tagId_key" ON "budget_category"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "budget_category_budget_id_normalized Name_key" ON "budget_category"("budget_id", "normalized Name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_user_id_normalized_name_key" ON "tag"("user_id", "normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_normalized_email_key" ON "user"("normalized_email");

-- AddForeignKey
ALTER TABLE "budget" ADD CONSTRAINT "budget_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_category" ADD CONSTRAINT "budget_category_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_category" ADD CONSTRAINT "budget_category_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tag_to_transaction" ADD CONSTRAINT "_tag_to_transaction_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_tag_to_transaction" ADD CONSTRAINT "_tag_to_transaction_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

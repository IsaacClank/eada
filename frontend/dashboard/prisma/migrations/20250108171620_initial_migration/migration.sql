-- CreateTable
CREATE TABLE "Budget" (
    "Id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "NormalizedName" TEXT NOT NULL,
    "Income" DECIMAL NOT NULL,
    "UserId" TEXT NOT NULL,
    CONSTRAINT "Budget_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "Id" TEXT NOT NULL PRIMARY KEY,
    "PercenTageOfIncome" DECIMAL NOT NULL,
    "BudgetId" TEXT,
    "TagId" TEXT NOT NULL,
    CONSTRAINT "BudgetCategory_BudgetId_fkey" FOREIGN KEY ("BudgetId") REFERENCES "Budget" ("Id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BudgetCategory_TagId_fkey" FOREIGN KEY ("TagId") REFERENCES "Tag" ("Id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "Id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "NormalizedName" TEXT NOT NULL,
    "Info" JSONB,
    "UserId" TEXT NOT NULL,
    CONSTRAINT "Tag_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TagToTransaction" (
    "TagId" TEXT NOT NULL,
    "TransactionId" TEXT NOT NULL,

    PRIMARY KEY ("TagId", "TransactionId"),
    CONSTRAINT "TagToTransaction_TagId_fkey" FOREIGN KEY ("TagId") REFERENCES "Tag" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TagToTransaction_TransactionId_fkey" FOREIGN KEY ("TransactionId") REFERENCES "Transaction" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "Id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL,
    "Amount" DECIMAL NOT NULL,
    "Notes" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    CONSTRAINT "Transaction_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User" ("Id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "Id" TEXT NOT NULL PRIMARY KEY,
    "Email" TEXT NOT NULL,
    "NormalizedEmail" TEXT NOT NULL,
    "EncryptedPassword" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Budget_UserId_NormalizedName_key" ON "Budget"("UserId", "NormalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_TagId_key" ON "BudgetCategory"("TagId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_UserId_NormalizedName_key" ON "Tag"("UserId", "NormalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "User_NormalizedEmail_key" ON "User"("NormalizedEmail");

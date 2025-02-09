import { ipcMain } from "electron";
import * as db from "./db";
import { CreateBudgetCategory, CreateTransaction } from "./db/contracts";

export enum IpcCommand {
  UpsertBudgetAsync = "UpsertBudgetAsync",
  GetDefaultBudgetAsync = "GetDefaultBudgetAsync",
  GetBudgetByNameAsync = "GetBudgetByNameAsync",
  CreateCategoriesForBudgetAsync = "CreateCategoriesForBudgetAsync",
  CreateTransactionsAsync = "CreateTransactionsAsync",
}

export function initIpc() {
  ipcMain.on(IpcCommand.UpsertBudgetAsync, (_, name: string, income: number) =>
    db.upsertBudgetAsync(name, income),
  );

  ipcMain.on(IpcCommand.GetDefaultBudgetAsync, (_) =>
    db.getDefaultBudgetAsync(),
  );

  ipcMain.on(IpcCommand.GetBudgetByNameAsync, (_, name: string) =>
    db.getBudgetByNameAsync(name),
  );

  ipcMain.on(
    IpcCommand.CreateCategoriesForBudgetAsync,
    (_, id: string, categories: CreateBudgetCategory[]) =>
      db.createCategoriesForBudgetAsync(id, categories),
  );

  ipcMain.on(
    IpcCommand.CreateTransactionsAsync,
    (_, data: CreateTransaction[]) => db.createTransactionsAsync(data),
  );
}

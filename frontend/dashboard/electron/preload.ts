import { contextBridge, ipcRenderer } from "electron";
import { IpcCommand } from "./ipc";
import { CreateBudgetCategory, CreateTransaction } from "./db/contracts";

contextBridge.exposeInMainWorld("db", {
  upsertBudgetAsync: (name: string, income: number) =>
    ipcRenderer.invoke(IpcCommand.UpsertBudgetAsync, name, income),

  getDefaultBudgetAsync: () =>
    ipcRenderer.invoke(IpcCommand.GetDefaultBudgetAsync),

  getBudgetByNameAsync: (name: string) =>
    ipcRenderer.invoke(IpcCommand.GetBudgetByNameAsync, name),

  createCategoriesForBudgetAsync: (
    id: string,
    categories: CreateBudgetCategory[],
  ) =>
    ipcRenderer.invoke(
      IpcCommand.CreateCategoriesForBudgetAsync,
      id,
      categories,
    ),

  createTransactionsAsync: (data: CreateTransaction[]) =>
    ipcRenderer.invoke(IpcCommand.CreateTransactionsAsync, data),
});

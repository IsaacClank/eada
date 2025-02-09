/// <reference types="vite-plugin-electron/electron-env" />

import { Budget } from "@prisma/client";
import { CreateBudgetCategory, CreateTransaction } from "./db/contracts";

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import("electron").IpcRenderer;
  db: {
    upsertBudgetAsync: (name: string, income: number) => Promise;
    getDefaultBudgetAsync: () => Promise<Budget>;
    getBudgetByNameAsync: (name: string) => Promise<Budget?>;
    createCategoriesForBudgetAsync: (
      id,
      categories: CreateBudgetCategory[],
    ) => Promise;
    createTransactionsAsync: (transactions: CreateTransaction[]) => Promise;
  };
}

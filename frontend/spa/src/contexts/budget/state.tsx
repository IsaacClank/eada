import { createContext } from "react";
import { BudgetOverview } from "./types";

export interface BudgetState {
  budget?: null | BudgetOverview;
}
export const BudgetStateContext = createContext<BudgetState>({});

export interface BudgetStateReducerInput {
  state: "unknown" | "nonExistent" | "created";
  budget?: BudgetOverview;
}
export type BudgetStateReducer = React.Dispatch<BudgetStateReducerInput>;
export const BudgetStateReducerContext = createContext<BudgetStateReducer>(_ => {});

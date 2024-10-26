import { createContext } from "react";

export interface BudgetState {
  budget?: {
    name?: string;
    normalizedName?: string;
    income?: string;
  } | null;
}
export const BudgetStateContext = createContext<BudgetState>({});

export interface BudgetStateReducerInput {
  state: "unknown" | "nonExistent" | "created";
  budget?: {
    name?: string;
    normalizedName?: string;
    income?: string;
  };
}
export type BudgetStateReducer = React.Dispatch<BudgetStateReducerInput>;
export const BudgetStateReducerContext = createContext<BudgetStateReducer>(_ => {});

import { createContext, PropsWithChildren, useReducer } from "react";

export interface BudgetState {
  name?: string;
  normalizedName?: string;
  income?: string;
}

export const BudgetContext = createContext<BudgetState>({});

export function BudgetContextProvider({ children }: PropsWithChildren) {
  const initialBudgetState: BudgetState = {};
  const budgetStatePatcher = (_state: BudgetState, _action: any) => {
    return _state;
  };
  const [] = useReducer(budgetStatePatcher, initialBudgetState);

  return <BudgetContext.Provider value={initialBudgetState}>{children}</BudgetContext.Provider>;
}

export interface BudgetStateUpdate {
  state: "created";
}

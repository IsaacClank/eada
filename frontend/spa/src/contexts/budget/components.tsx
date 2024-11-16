import { PropsWithChildren, useContext, useEffect, useReducer } from "react";

import { AuthStateContext } from "../auth";
import { RuntimeContext } from "../runtime";
import {
  BudgetState,
  BudgetStateContext,
  BudgetStateReducerContext,
  BudgetStateReducerInput,
} from "./state";
import { BudgetList, BudgetOverview } from "./types";

export function BudgetContextProvider({ children }: PropsWithChildren) {
  const { apiClientFactory } = useContext(RuntimeContext);
  const authState = useContext(AuthStateContext);
  const [budgetState, reduceBudgetState] = useReducer(budgetStateReducer, {});

  useEffect(() => {
    if (authState.authenticated == null || authState.token == null) {
      return;
    }

    if (authState.authenticated === false) {
      reduceBudgetState({ state: "unknown" });
      return;
    }

    const retrieveDefaultBudget = async () => {
      const httpClient = apiClientFactory().token(authState.token).httpClient;
      const budgets: BudgetList = await httpClient.getJsonAsync("budget").then(res => res.json());

      if (budgets.length === 0) {
        reduceBudgetState({ state: "nonExistent" });
      }

      const defaultBudgetId = budgets.shift()!.id;
      const budget: BudgetOverview = await httpClient
        .getJsonAsync(`budget/${defaultBudgetId}`)
        .then(res => res.json());
      reduceBudgetState({ state: "created", budget });
    };

    retrieveDefaultBudget();
  }, [authState.authenticated, reduceBudgetState, apiClientFactory]);

  return (
    <BudgetStateContext.Provider value={budgetState}>
      <BudgetStateReducerContext.Provider value={reduceBudgetState}>
        {children}
      </BudgetStateReducerContext.Provider>
    </BudgetStateContext.Provider>
  );
}

const budgetStateReducer = (state: BudgetState, input: BudgetStateReducerInput): BudgetState => {
  switch (input.state) {
    case "created":
      return { ...state, budget: input.budget };
    case "nonExistent":
      return { ...state, budget: null };
    case "unknown":
      return { ...state, budget: undefined };
    default:
      return state;
  }
};

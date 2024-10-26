import { PropsWithChildren, useContext, useEffect, useReducer } from "react";

import { AuthStateContext } from "../auth";
import {
  BudgetState,
  BudgetStateContext,
  BudgetStateReducerContext,
  BudgetStateReducerInput,
} from "./state";

export function BudgetContextProvider({ children }: PropsWithChildren) {
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

    fetch("http://localhost:3000/budget", {
      method: "GET",
      headers: [["Authorization", `Bearer ${authState.token}`]],
    }).then(res => {
      if (res.ok) {
        res.json().then(budget => reduceBudgetState({ state: "created", budget }));
      }

      if (res.status === 404) {
        reduceBudgetState({ state: "nonExistent" });
      }
    });
  }, [authState.authenticated, reduceBudgetState]);

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

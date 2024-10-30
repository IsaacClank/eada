import { FormEvent, useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { SubmitForm } from "../../components/form";
import { Input } from "../../components/input";
import { PageContainer } from "../../components/page";
import { AuthStateContext } from "../../contexts/auth";
import { BudgetStateContext, BudgetStateReducerContext } from "../../contexts/budget";

export function CreateBudget() {
  const navigate = useNavigate();
  const authState = useContext(AuthStateContext);
  const budgetState = useContext(BudgetStateContext);
  const reduceBudgetState = useContext(BudgetStateReducerContext);

  useEffect(() => {
    budgetState.budget != null && navigate("/");
  }, [budgetState.budget]);

  const submitForm = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      formData.append("name", "default");
      const formJson = Object.fromEntries(formData.entries());

      const res = await fetch("http://localhost:3000/budget", {
        method: "PUT",
        body: JSON.stringify(formJson),
        headers: [
          ["Authorization", `Bearer ${authState.token}`],
          ["Content-Type", "application/json"],
        ],
      });

      if (res.ok) {
        reduceBudgetState({
          state: "created",
          budget: await res.json(),
        });
      }
    },
    [authState.token, reduceBudgetState],
  );

  return (
    budgetState.budget !== undefined && (
      <PageContainer>
        <form className="w-full lg:w-96 flex flex-col gap-5" onSubmit={e => submitForm(e)}>
          <div>
            <div>
              <label htmlFor="income">Monthly income</label>
              <Input type="number" name="income" required />
            </div>
          </div>

          <SubmitForm className="p-1" />
        </form>
      </PageContainer>
    )
  );
}

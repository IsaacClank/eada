import { FormEvent, useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { SubmitForm } from "../../components/form";
import { Input } from "../../components/input";
import { PageContainer } from "../../components/page";
import { AuthStateContext } from "../../contexts/auth";
import { BudgetStateContext, BudgetStateReducerContext } from "../../contexts/budget";

export function BudgetOverview() {
  const navigate = useNavigate();
  const authState = useContext(AuthStateContext);
  const budgetState = useContext(BudgetStateContext);

  useEffect(() => {
    authState.authenticated === false && navigate("/login");
  }, [authState.authenticated]);

  return (
    budgetState.budget !== undefined && (
      <PageContainer>
        {budgetState.budget === null ? <CreateBudget /> : "Budget is created"}
      </PageContainer>
    )
  );
}

function CreateBudget() {
  return (
    <>
      <h1 className="text-center">Create a budget</h1>
      <BudgetCreationForm />
    </>
  );
}

function BudgetCreationForm() {
  const authState = useContext(AuthStateContext);
  const reduceBudgetState = useContext(BudgetStateReducerContext);

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
    <form className="w-full lg:w-96 flex flex-col gap-5" onSubmit={e => submitForm(e)}>
      <div>
        <div>
          <label htmlFor="income">Monthly income</label>
          <Input type="number" name="income" required />
        </div>
      </div>

      <SubmitForm className="p-1" />
    </form>
  );
}

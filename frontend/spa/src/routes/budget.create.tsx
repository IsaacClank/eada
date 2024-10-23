import { useContext, useCallback, FormEvent, Dispatch } from "react";

import { SubmitForm } from "../components/form";
import Input from "../components/input";
import { AuthStateContext } from "../contexts/auth.context";

export interface CreateBudgetProps {
  setBudget?: Dispatch<any>;
}

export function CreateBudget({ setBudget }: CreateBudgetProps) {
  const authState = useContext(AuthStateContext);

  const submitBudgetCreationForm = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      formData.append("name", "default");
      const formJson = Object.fromEntries(formData.entries());

      console.log(formJson);

      fetch("http://localhost:3000/budget", {
        method: "PUT",
        body: JSON.stringify(formJson),
        headers: [
          ["Authorization", `Bearer ${authState.token}`],
          ["Content-Type", "application/json"],
        ],
      }).then((res) => {
        if (res.ok) {
          return res.json();
        }

        throw res.status;
      });
      // TODO: uncomment this
      //.then((budget) => setBudget(budget));
    },
    [authState.token, setBudget],
  );

  return (
    <form className="w-96 flex flex-col gap-5" onSubmit={(e) => submitBudgetCreationForm(e)}>
      <div>
        <h1 className="text-2xl">Create a budget</h1>
      </div>
      <div>
        <div>
          <label htmlFor="income">What is your expected monthly income?</label>
          <Input type="number" name="income" required />
        </div>
      </div>

      <SubmitForm value="Submit" className="p-1" />
    </form>
  );
}

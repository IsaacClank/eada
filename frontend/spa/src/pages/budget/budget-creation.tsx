import { useCallback, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "../../components/button";
import { SubmitForm } from "../../components/form";
import { Input } from "../../components/form";
import { PageContainer } from "../../components/page";
import { H1 } from "../../components/text";
import { AuthStateContext } from "../../contexts/auth";
import { BudgetStateContext, BudgetStateReducerContext } from "../../contexts/budget";
import { RuntimeContext } from "../../contexts/runtime";

export function CreateBudget() {
  const navigate = useNavigate();
  const { budget } = useContext(BudgetStateContext);

  useEffect(() => {
    const budgetIsNotLoaded = budget === undefined;
    const budgetIsCreatedWithoutSubCategories = budget != null && budget.categories.length > 0;
    if (budgetIsNotLoaded || budgetIsCreatedWithoutSubCategories) {
      navigate("/");
    }
  }, [budget]);

  return (
    budget !== undefined && (
      <PageContainer className="pt-32">
        <div className="basis-full pb-32 flex flex-col justify-between">
          <H1 className="mb-20">
            {budget == null
              ? "What is your monthly income?"
              : "Create subcategories for your budget"}
          </H1>

          <div className="flex-grow flex flex-col items-center">
            {budget == null ? <BudgetIncomeForm /> : <CreateBudgetCategories />}
          </div>
        </div>
      </PageContainer>
    )
  );
}

interface CreateBudget {
  income: number;
}

function BudgetIncomeForm() {
  const authState = useContext(AuthStateContext);
  const reduceBudgetState = useContext(BudgetStateReducerContext);
  const form = useForm<CreateBudget>();
  const { apiClientFactory } = useContext(RuntimeContext);

  const createBudget = useCallback(
    async (data: CreateBudget) => {
      const res = await apiClientFactory()
        .token(authState.token)
        .httpClient.putJsonAsync("budget", {
          name: "default",
          ...data,
        });
      if (res.ok) {
        reduceBudgetState({ state: "unknown" }); // Trigger reload of budget data
      }
    },
    [authState.token, reduceBudgetState, apiClientFactory],
  );

  return (
    <form
      className="size-full flex flex-col justify-between"
      onSubmit={form.handleSubmit(data => createBudget(data))}
    >
      <div>
        <Input formConfig={form.register("income", { required: true })} />
      </div>

      <div className="flex justify-end">
        <SubmitForm className="px-4 py-2 bg-pink-600 text-black" value="Next" />
      </div>
    </form>
  );
}

interface CreateBudgetCategories {
  categories: {
    name?: string;
    percentageOfIncome?: number;
  }[];
}

function CreateBudgetCategories() {
  const { apiClientFactory } = useContext(RuntimeContext);
  const { token } = useContext(AuthStateContext);
  const { budget } = useContext(BudgetStateContext);
  const reduceBudgetState = useContext(BudgetStateReducerContext);

  const form = useForm<CreateBudgetCategories>({
    defaultValues: {
      categories: [{}],
    },
  });
  const formItems = useFieldArray({
    name: "categories",
    control: form.control,
  });

  const createBudgetCategories = useCallback(
    async (data: CreateBudgetCategories) => {
      const res = await apiClientFactory()
        .token(token)
        .httpClient.putJsonAsync(`budget/${budget?.id}/category`, data.categories);

      if (res.ok) {
        reduceBudgetState({ state: "unknown" }); // Trigger reload of budget data
      }
    },
    [apiClientFactory, token],
  );

  return (
    <form
      className="size-full flex flex-col justify-between"
      onSubmit={form.handleSubmit(createBudgetCategories)}
    >
      <div className="flex-grow flex flex-col items-center gap-4 mb-20">
        <div className="flex flex-col gap-2">
          {formItems.fields.map((field, index) => (
            <div key={field.id} className="flex justify-between items-center gap-2">
              <div className="basis-1/4">
                <Input
                  placeholder="%"
                  formConfig={form.register(`categories.${index}.percentageOfIncome`)}
                />
              </div>

              <div className="flex-auto">
                <Input
                  placeholder="Category name..."
                  formConfig={form.register(`categories.${index}.name`)}
                />
              </div>

              <Button
                label="-"
                className="size-8 bg-blue-200"
                onClick={() => {
                  formItems.remove(index);
                }}
              />
            </div>
          ))}
        </div>

        <Button className="size-6 bg-blue-200" onClick={() => formItems.append({})} label="+" />
      </div>

      <div className="flex justify-end">
        <SubmitForm className="px-4 py-2 bg-pink-600 text-black" value="Next" />
      </div>
    </form>
  );
}

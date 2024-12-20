import dayjs from "dayjs";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { Button } from "../../components/button";
import { Input, SubmitForm } from "../../components/form";
import { Overlay } from "../../components/overlay";
import { PageContainer } from "../../components/page";
import { ProgressBar } from "../../components/progress-bar";
import { H2, PrettyNumber } from "../../components/text";
import { AuthStateContext } from "../../contexts/auth";
import { BudgetStateContext } from "../../contexts/budget";
import { RuntimeContext } from "../../contexts/runtime";
import { datetime } from "../../lib/datetime";
import { BaseProps } from "../../lib/std";

export function BudgetOverview() {
  const navigate = useNavigate();
  const { budget } = useContext(BudgetStateContext);
  const [transactionCreationFormIsEnabled, toggleTransactionCreationForm] = useState(false);

  useEffect(() => {
    if (budget === null || budget?.categories.length === 0) {
      navigate("/budget/create");
      return;
    }
  }, [budget]);

  return (
    budget != null && (
      <PageContainer>
        <div className="h-full w-full pt-16 flex flex-col gap-10">
          <div className="flex justify-between items-center">
            <span className="text-lg">{dayjs().format("MMM, YYYY")}</span>
            <button className="p-2 rounded bg-violet-400 text-sm text-black">+ Transaction</button>
          </div>

          <div className="flex justify-center items-stretch gap-4 basis-16">
            <div className="bg-slate-500 basis-1/2 flex flex-col justify-center px-4 rounded-md">
              <div className="text-xs text-gray-300">Total expense</div>
              <div className="text-sm">
                VND <PrettyNumber value={budget.totalExpenseInMonth} />
              </div>
            </div>
            <div className="bg-slate-500 basis-1/2 flex flex-col justify-center px-4 rounded-md">
              <div className="text-xs text-gray-300">Total remaining</div>
              <div className="text-sm">
                VND <PrettyNumber value={budget.totalRemainingInMonth} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <H2 className="text-xl">Budget</H2>

            {budget.categories.map(
              ({ name, totalExpenseInMonth, totalRemainingInMonth }, index) => (
                <div key={`budget_category_overview_${index}`} className="flex gap-4 items-center">
                  <div className="basis-1/2">{name}</div>
                  <div className="flex-grow pt-2">
                    <ProgressBar
                      className="h-1"
                      total={totalExpenseInMonth + totalRemainingInMonth}
                      progress={totalExpenseInMonth}
                    />
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <H2 className="text-xl">Transactions</H2>
              <Button
                className="size-6 bg-yellow-600 text-black"
                onClick={() => toggleTransactionCreationForm(true)}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <TransactionCreationFormOverlay
          overlayIsEnabled={transactionCreationFormIsEnabled}
          toggleOverlay={(enabled: boolean) => toggleTransactionCreationForm(enabled)}
        />
      </PageContainer>
    )
  );
}

interface TransactionCreationForm extends BaseProps {
  overlayIsEnabled: boolean;
  toggleOverlay: (_: boolean) => void;
}

interface TransactionCreationFormData {
  createdAt: string;
  amount: number;
  type: "Expense" | "Income";
  tags: string | string[];
  notes: string;
}

function TransactionCreationFormOverlay(props: TransactionCreationForm) {
  const { apiClientFactory } = useContext(RuntimeContext);
  const { token } = useContext(AuthStateContext);

  const form = useForm<TransactionCreationFormData>({
    defaultValues: {
      amount: 0,
      createdAt: datetime().format("YYYY-MM-DDTHH:mm"),
      tags: "",
      notes: "",
      type: "Expense",
    },
  });

  const submitTransactionCreationForm = useCallback(
    async (data: TransactionCreationFormData) => {
      const httpClient = apiClientFactory().token(token ?? null).httpClient;
      const res = await httpClient.postJsonAsync("transaction", [data]);

      if (res.ok) {
        props.toggleOverlay(false);
      }
    },
    [apiClientFactory, token, props.toggleOverlay],
  );

  return (
    <Overlay
      enabled={props.overlayIsEnabled}
      toggle={(enabled: boolean) => props.toggleOverlay(enabled)}
      className="flex justify-center items-center"
    >
      <form
        className="w-80 h-fit px-6 py-10 flex flex-col gap-6 bg-blue-50"
        onSubmit={form.handleSubmit(data => submitTransactionCreationForm(data))}
      >
        <div className="flex items-center gap-2">
          <div className="basis-1/12">Icon</div>
          <Input
            type="text"
            className="flex-grow"
            formConfig={form.register("tags", {
              required: false,
              setValueAs: (raw: string) => raw.split(" "),
            })}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="basis-1/12">Icon</div>
          <Input
            type="datetime-local"
            className="flex-grow"
            formConfig={form.register("createdAt", { required: false })}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="basis-1/12">Icon</div>
          <Input
            type="number"
            className="flex-grow"
            formConfig={form.register("amount", { required: false })}
          />
        </div>

        <div className="flex gap-2">
          <div className="basis-1/12">Icon</div>
          <textarea
            rows={5}
            className="flex-grow bg-blue-200 px-2 py-1"
            {...form.register("notes", { required: false })}
          />
        </div>

        <SubmitForm className="px-4 py-2 bg-blue-600 text-black" />
      </form>
    </Overlay>
  );
}

import dayjs from "dayjs";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "../../components/page";
import { ProgressBar } from "../../components/progress-bar";
import { H2, PrettyNumber } from "../../components/text";
import { BudgetStateContext } from "../../contexts/budget";

export function BudgetOverview() {
  const navigate = useNavigate();
  const { budget } = useContext(BudgetStateContext);

  useEffect(() => {
    if (budget === null || budget?.categories.length === 0) {
      navigate("/budget/create");
      return;
    }
  }, [budget]);

  return (
    budget != null && (
      <PageContainer className="bg-slate-600 text-white">
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
                  <div>{name}</div>
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
        </div>
      </PageContainer>
    )
  );
}

import dayjs from "dayjs";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "../../components/page";
import { BudgetStateContext } from "../../contexts/budget";

export function BudgetOverview() {
  const navigate = useNavigate();
  const budgetState = useContext(BudgetStateContext);

  useEffect(() => {
    budgetState.budget === null && navigate("/budget/create");
  }, [budgetState.budget]);

  return (
    budgetState.budget != null && (
      <PageContainer>
        <div className="h-full w-full pt-16 flex flex-col">
          <div className="flex justify-between items-center">
            <span className="text-lg">{dayjs().format("MMM, YYYY")}</span>
            <button className="p-2 rounded bg-black text-sm text-white">+Transaction</button>
          </div>

          <div className="pt-8 flex justify-center items-stretch gap-4 basis-28">
            <div className="bg-black flex-grow"></div>
            <div className="bg-black flex-grow"></div>
          </div>
        </div>
      </PageContainer>
    )
  );
}

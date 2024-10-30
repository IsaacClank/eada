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

  return budgetState.budget != null && <PageContainer>Budget is created</PageContainer>;
}

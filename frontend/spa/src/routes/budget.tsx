import { Dispatch, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthStateContext } from "../contexts/auth.context";
import PageContainer from "../components/page";
import { CreateBudget } from "./budget.create";

export default function BudgetPage() {
  const navigate = useNavigate();

  const authState = useContext(AuthStateContext);
  useEffect(() => {
    if (!authState.authenticated) {
      navigate("/login");
    }
  }, [authState]);

  const [budget, setBudget] = useState<any>(undefined);
  useEffect(() => {
    if (!authState.authenticated) {
      return;
    }

    fetch("http://localhost:3000/budget", {
      method: "GET",
      headers: [["Authorization", `Bearer ${authState.token}`]],
    }).then((res) => {
      if (res.ok) {
        res.json().then((budget) => setBudget(budget));
      }

      if (res.status !== 404) {
        throw "Unexpected error";
      }
    });
  }, [authState.token, setBudget]);

  return (
    budget !== undefined && (
      <PageContainer className="p-24">
        <div>{budget ? "Has budget" : <CreateBudget setBudget={setBudget} />}</div>
      </PageContainer>
    )
  );
}

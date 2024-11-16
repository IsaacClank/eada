import { Outlet } from "react-router-dom";

import { AuthContextProvider } from "./contexts/auth";
import { BudgetContextProvider } from "./contexts/budget";
import { RuntimeContextProvider } from "./contexts/runtime";

export function App() {
  return (
    <RuntimeContextProvider>
      <AuthContextProvider>
        <BudgetContextProvider>
          <Outlet />
        </BudgetContextProvider>
      </AuthContextProvider>
    </RuntimeContextProvider>
  );
}

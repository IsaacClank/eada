import { Outlet } from "react-router-dom";
import { AuthContextProvider } from "./contexts/auth";
import { BudgetContextProvider } from "./contexts/budget";

export default function App() {
  return (
    <AuthContextProvider>
      <BudgetContextProvider>
        <Outlet />
      </BudgetContextProvider>
    </AuthContextProvider>
  );
}

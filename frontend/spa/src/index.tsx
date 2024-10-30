import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { App } from "./app";
import { Redirect } from "./components/util";
import { AuthAction, AuthPage } from "./pages/auth";
import { CreateBudget } from "./pages/budget/budget-creation";
import { BudgetOverview } from "./pages/budget/budget-overview";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "/",
          element: <App />,
          children: [
            {
              path: "/login",
              element: <AuthPage authAction={AuthAction.Login} />,
            },
            {
              path: "/register",
              element: <AuthPage authAction={AuthAction.Register} />,
            },
            {
              path: "/",
              element: <Redirect route="/budget" />,
            },
            {
              path: "/budget",
              element: <BudgetOverview />,
              children: [],
            },
            {
              path: "/budget/create",
              element: <CreateBudget />,
              children: [],
            },
          ],
        },
      ])}
    />
  </StrictMode>,
);

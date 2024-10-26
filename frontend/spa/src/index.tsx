import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./app";
import "./index.css";
import { AuthAction, AuthPage } from "./pages/auth";
import { BudgetOverview } from "./pages/budget/budget-overview";

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
              element: <BudgetOverview />,
              children: [],
            },
          ],
        },
      ])}
    />
  </StrictMode>,
);

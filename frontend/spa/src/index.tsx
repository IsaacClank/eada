import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import RegistrationPage from "./routes/register";
import LoginPage from "./routes/login";
import App from "./app";
import BudgetPage from "./routes/budget";
import { CreateBudget } from "./routes/budget.create";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "/",
          element: <App />,
          children: [
            {
              path: "/",
              element: <BudgetPage />,
              children: [
                {
                  path: "/create",
                  element: <CreateBudget />,
                },
              ],
            },
            {
              path: "/register",
              element: <RegistrationPage />,
            },
            {
              path: "/login",
              element: <LoginPage />,
            },
          ],
        },
      ])}
    />
  </StrictMode>,
);

import { StrictMode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createRoot } from "react-dom/client";

import "./index.css";
import AppPage from "./routes/app";
import RegistrationPage from "./routes/register";
import LoginPage from "./routes/login";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider
      router={createBrowserRouter([
        {
          path: "/register",
          element: <RegistrationPage />,
        },
        {
          path: "/login",
          element: <LoginPage />,
        },
        {
          path: "/",
          element: <AppPage />,
          children: [],
        },
      ])}
    />
  </StrictMode>,
);

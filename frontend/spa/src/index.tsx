import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegistrationPage from "./routes/register";
import LoginPage from "./routes/login";
import App from "./app";
import HomePage from "./routes/home";

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
              element: <HomePage />,
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

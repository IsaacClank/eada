import { StrictMode } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { createRoot } from 'react-dom/client'

import App from './App';

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter([
      {
        path: "/",
        element: <App />,
        children: []
      }
    ])} />
  </StrictMode>,
)

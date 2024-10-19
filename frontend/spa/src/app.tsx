import { Outlet } from "react-router-dom";
import { AuthContextProvider } from "./contexts/auth.context";

export default function App() {
  return (
    <AuthContextProvider>
      <Outlet />
    </AuthContextProvider>
  );
}

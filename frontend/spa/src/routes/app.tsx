import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function AppPage() {
  const navigate = useNavigate();
  const [authenticated, _setAuthenticated] = useState(isAuthenticated());

  useEffect(() => {
    if (!authenticated) {
      navigate("/register");
    }
  }, [authenticated]);

  return (
    <div id="app">
      <Outlet />
    </div>
  );
}

function isAuthenticated() {
  return localStorage.getItem("accessToken");
}

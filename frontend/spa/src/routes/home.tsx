import { useContext, useEffect } from "react";
import { AuthStateContext } from "../contexts/auth.context";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const authState = useContext(AuthStateContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.authenticated === false) {
      navigate("/login");
    }
  }, [authState]);

  return <h1>Home</h1>;
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Redirect({ route }: { route: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(route);
  });
  return <></>;
}

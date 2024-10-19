import { useNavigate } from "react-router-dom";

import Input from "../components/input";
import PageContainer from "../components/page";
import { useContext, useEffect, useState } from "react";
import { AuthStateContext, AuthStatePatcherContext } from "../contexts/auth.context";

export default function LoginPage() {
  const [canRender, setCanRender] = useState(false);
  const authState = useContext(AuthStateContext);
  const authStatePatcher = useContext(AuthStatePatcherContext);
  const navigate = useNavigate();

  useEffect(() => {
    setCanRender(authState.authenticated != null);
  }, [authState.authenticated]);

  useEffect(() => {
    if (authState.authenticated) {
      navigate("/");
    }
  }, [authState.authenticated]);

  const submitLoginForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    fetch("http://localhost:3000/account/session", {
      method: "POST",
      body: JSON.stringify(formJson),
      headers: [["Content-Type", "application/json"]],
    })
      .then((res) => res.json())
      .then((tokens) => {
        localStorage.setItem("accessToken", tokens.accessToken);
        authStatePatcher({ type: "authenticated" });
        navigate("/", { replace: true });
      });
  };

  return (
    canRender && (
      <PageContainer className="p-24">
        <form className="w-96 flex flex-col gap-5" onSubmit={(e) => submitLoginForm(e)}>
          <div className="flex flex-col gap-2">
            <div>
              <label htmlFor="email">Email</label>
              <Input required type="email" name="email" className="inline-block" />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <div>
                <Input required type="password" name="password" className="inline-block" />
              </div>
            </div>
          </div>

          <input type="submit" value="Login" className="bg-blue-300" />
        </form>
      </PageContainer>
    )
  );
}

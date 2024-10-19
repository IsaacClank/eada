import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../components/page";
import Input from "../components/input";
import { AuthStateContext } from "../contexts/auth.context";

export default function RegistrationPage() {
  const [canRender, setCanRender] = useState(false);
  const authState = useContext(AuthStateContext);
  const navigate = useNavigate();

  useEffect(() => {
    setCanRender(authState.authenticated != null);
  }, [authState.authenticated]);

  useEffect(() => {
    if (authState.authenticated != null) {
      setCanRender(true);
    }

    if (authState.authenticated) {
      navigate("/");
    }
  }, [authState.authenticated]);

  const submitRegistrationForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    fetch("http://localhost:3000/account", {
      method: "PUT",
      body: JSON.stringify(formJson),
      headers: [["Content-Type", "application/json"]],
    }).then(() => {
      navigate("/login");
    });
  };

  return (
    canRender && (
      <PageContainer className="p-24">
        <form className="flex flex-col gap-5 w-96" onSubmit={(e) => submitRegistrationForm(e)}>
          <div className="flex flex-col gap-2">
            <div>
              <label htmlFor="email">Email</label>
              <Input type="email" name="email" className="inline-block" />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <div>
                <Input type="password" name="password" className="inline-block" />
              </div>
            </div>
          </div>

          <input type="submit" value="Register" className="bg-blue-300" />
        </form>
      </PageContainer>
    )
  );
}

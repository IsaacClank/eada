import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Input, SubmitForm } from "../components/form";
import { PageContainer } from "../components/page";
import { AuthStateContext } from "../contexts/auth";
import { RuntimeContext } from "../contexts/runtime";
import { LocalStorageKey } from "../lib/std";

export interface AuthPageProps {
  authAction: AuthAction;
}
export enum AuthAction {
  Login,
  Register,
}
export function AuthPage({ authAction }: AuthPageProps) {
  const navigate = useNavigate();
  const authState = useContext(AuthStateContext);

  useEffect(() => {
    if (authState.authenticated) {
      navigate("/");
    }
  }, [authState.authenticated]);

  return (
    authState.authenticated != null && (
      <PageContainer>
        <h1 className="text-center">{authAction === AuthAction.Login ? "Login" : "Register"}</h1>
        <AuthForm authAction={authAction} />
      </PageContainer>
    )
  );
}

interface AuthFormProps {
  authAction: AuthAction;
}
function AuthForm({ authAction }: AuthFormProps) {
  const navigate = useNavigate();
  const { token } = useContext(AuthStateContext);
  const { apiClientFactory } = useContext(RuntimeContext);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());

    const httpClient = apiClientFactory().token(token ?? null).httpClient;

    if (authAction === AuthAction.Register) {
      httpClient.putJsonAsync("account", formJson).then(() => navigate("/login"));
    } else {
      const tokenResponse = await httpClient
        .postJsonAsync("account/session", formJson)
        .then(res => res.json());
      localStorage.setItem(LocalStorageKey.AccessToken, tokenResponse.accessToken);
      location.reload();
    }
  };

  return (
    <form className="w-full lg:w-96 flex flex-col gap-5" onSubmit={e => submitForm(e)}>
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

      <SubmitForm />

      {authAction === AuthAction.Login ? <PromptRegistration /> : <PromptLogin />}
    </form>
  );
}

function PromptRegistration() {
  return (
    <span>
      Don't have an account? <Link to={"/register"}>Register</Link> one
    </span>
  );
}

function PromptLogin() {
  return (
    <span>
      Already have an account? <Link to={"/login"}>Login</Link> now
    </span>
  );
}

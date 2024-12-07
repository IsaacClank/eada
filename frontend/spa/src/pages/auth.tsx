import { useCallback, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { Input, SubmitForm } from "../components/form";
import { PageContainer } from "../components/page";
import { H1 } from "../components/text";
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
      <PageContainer className="gap-10">
        <div className="self-start">
          <H1>{authAction === AuthAction.Login ? "Login" : "Register"}</H1>
        </div>
        <AuthForm authAction={authAction} />
      </PageContainer>
    )
  );
}

interface AuthFormProps {
  authAction: AuthAction;
}
interface AuthFormData {
  email: string;
  password: string;
}
function AuthForm({ authAction }: AuthFormProps) {
  const form = useForm<AuthFormData>();
  const navigate = useNavigate();
  const { token } = useContext(AuthStateContext);
  const { apiClientFactory } = useContext(RuntimeContext);

  const submitAuthForm = useCallback(
    async (data: AuthFormData) => {
      const httpClient = apiClientFactory().token(token ?? null).httpClient;

      if (authAction === AuthAction.Register) {
        const res = await httpClient.putJsonAsync("account", data);
        if (res.ok) {
          navigate("/login");
        } else {
          form.reset(form.getValues());
        }

        return;
      }

      if (authAction === AuthAction.Login) {
        const res = await httpClient.postJsonAsync("account/session", data);
        if (res.ok) {
          const resJsonContent = await res.json();
          localStorage.setItem(LocalStorageKey.AccessToken, resJsonContent.accessToken);
          location.reload();
        } else {
          form.resetField("password");
        }
        return;
      }
    },
    [apiClientFactory, token, navigate],
  );

  useEffect(() => {
    form.reset();
  }, [authAction]);

  return (
    <form
      className="w-full lg:w-96 flex flex-col gap-8"
      onSubmit={form.handleSubmit(data => submitAuthForm(data))}
    >
      <div className="flex flex-col gap-2">
        <div>
          <Input
            label="Email"
            type="email"
            formConfig={form.register("email", { required: true })}
            className="inline-block"
          />
        </div>

        <div>
          <Input
            label="Password"
            type="password"
            formConfig={form.register("password", { required: true })}
            className="inline-block"
          />
        </div>
      </div>

      <SubmitForm className="px-4 py-2 bg-blue-600 text-black" />

      {authAction === AuthAction.Login ? <PromptRegistration /> : <PromptLogin />}
    </form>
  );
}

function PromptRegistration() {
  return (
    <span>
      Don't have an account?{" "}
      <Link className="text-pink-600" to={"/register"}>
        Register
      </Link>{" "}
      one
    </span>
  );
}

function PromptLogin() {
  return (
    <span>
      Already have an account?{" "}
      <Link className="text-pink-600" to={"/login"}>
        Login
      </Link>{" "}
      now
    </span>
  );
}

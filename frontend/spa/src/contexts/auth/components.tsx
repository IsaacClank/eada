import { PropsWithChildren, useContext, useEffect, useReducer } from "react";

import { useNavigate } from "react-router-dom";
import { error, ErrorCodes } from "../../lib/error";
import { LocalStorageKey } from "../../lib/std";
import { RuntimeContext } from "../runtime";
import {
  AuthState,
  AuthStateContext,
  AuthStateReducerContext,
  AuthStateReducerInput,
} from "./state";

export function AuthContextProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { apiClientFactory } = useContext(RuntimeContext);
  const [authState, reduceAuthState] = useReducer(authStateReducer, {});

  useEffect(() => {
    authState.authenticated === false && navigate("/login");
  }, [authState.authenticated]);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem(LocalStorageKey.AccessToken);

    if (!storedAccessToken) {
      reduceAuthState({ state: "unauthenticated" });
      return;
    }

    apiClientFactory()
      .token(storedAccessToken)
      .httpClient.getJsonAsync("account/session")
      .then(async res => {
        if (res.ok) {
          const body = await res.json();
          reduceAuthState({ state: "authenticated", token: storedAccessToken, user: body });
        } else {
          localStorage.removeItem(LocalStorageKey.AccessToken); // Remove the stale token
          reduceAuthState({ state: "unauthenticated" });
        }
      });
  }, [reduceAuthState, apiClientFactory]);

  return (
    <AuthStateContext.Provider value={authState}>
      <AuthStateReducerContext.Provider value={reduceAuthState}>
        {children}
      </AuthStateReducerContext.Provider>
    </AuthStateContext.Provider>
  );
}

const authStateReducer = (state: AuthState, input: AuthStateReducerInput): AuthState => {
  switch (input.state) {
    case "authenticated":
      if (!input.token) {
        throw error(ErrorCodes.UnexpectedError, "Access token not found");
      }

      if (!input.user) {
        throw error(ErrorCodes.UnexpectedError, "User data not found");
      }

      return { ...state, authenticated: true, token: input.token, user: input.user };
    case "unauthenticated":
      return { ...state, authenticated: false, token: null, user: null };
    default:
      return state;
  }
};

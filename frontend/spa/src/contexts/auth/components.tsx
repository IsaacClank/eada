import { PropsWithChildren, useEffect, useReducer } from "react";

import { error, ErrorCodes } from "../../lib/error";
import { LocalStorageKey } from "../../lib/std";
import {
  AuthState,
  AuthStateContext,
  AuthStateReducerContext,
  AuthStateReducerInput,
} from "./state";

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [authState, reduceAuthState] = useReducer(authStateReducer, {});

  useEffect(() => {
    const storedAccessToken = localStorage.getItem(LocalStorageKey.AccessToken);

    if (!storedAccessToken) {
      reduceAuthState({ state: "unauthenticated" });
      return;
    }

    fetch("http://localhost:3000/account/session", {
      method: "GET",
      headers: [["Authorization", `Bearer ${storedAccessToken}`]],
    }).then(res => {
      if (res.ok) {
        reduceAuthState({ state: "authenticated", token: storedAccessToken });
      } else {
        localStorage.removeItem(LocalStorageKey.AccessToken); // Remove the stale token
        reduceAuthState({ state: "unauthenticated" });
      }
    });
  }, [reduceAuthState]);

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
        error(ErrorCodes.UnexpectedError, "Access token not found");
      }
      return { ...state, authenticated: true, token: input.token };
    case "unauthenticated":
      return { ...state, authenticated: false, token: null };
    default:
      return state;
  }
};

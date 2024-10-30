import { PropsWithChildren, useEffect, useReducer } from "react";

import { useNavigate } from "react-router-dom";
import { error, ErrorCodes } from "../../lib/error";
import { LocalStorageKey } from "../../lib/std";
import {
  AuthState,
  AuthStateContext,
  AuthStateReducerContext,
  AuthStateReducerInput,
} from "./state";

export function AuthContextProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
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

    fetch("http://localhost:3000/account/session", {
      method: "GET",
      headers: [["Authorization", `Bearer ${storedAccessToken}`]],
    }).then(async res => {
      if (res.ok) {
        const body = await res.json();
        console.log(body);
        reduceAuthState({ state: "authenticated", token: storedAccessToken, user: body });
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

      if (!input.user) {
        error(ErrorCodes.UnexpectedError, "User data not found");
      }

      return { ...state, authenticated: true, token: input.token, user: input.user };
    case "unauthenticated":
      return { ...state, authenticated: false, token: null, user: null };
    default:
      return state;
  }
};

import { createContext, PropsWithChildren, useEffect, useReducer } from "react";
import { LocalStorageKey } from "../lib/types";

export interface AuthState {
  authenticated: boolean | null;
  token: string | null;
}
const initialAuthState: AuthState = { authenticated: null, token: null };

interface AuthStatePatcherAction {
  state: "authenticated" | "unauthenticated";
  token?: string | null;
}

export function AuthContextProvider({ children }: PropsWithChildren) {
  const authStatePatcher = (state: AuthState, action: AuthStatePatcherAction) => {
    switch (action.state) {
      case "authenticated":
        return { ...state, authenticated: true, token: action.token } as AuthState;
      case "unauthenticated":
        return { ...state, authenticated: false, token: null } as AuthState;
      default:
        return state;
    }
  };
  const [state, patchAuthState] = useReducer(authStatePatcher, initialAuthState);

  useEffect(() => {
    const existingToken = localStorage.getItem(LocalStorageKey.AccessToken);

    if (existingToken == null) {
      patchAuthState({ state: "unauthenticated" });
    }

    fetch("http://localhost:3000/account/session", {
      method: "GET",
      headers: [["Authorization", `Bearer ${existingToken}`]],
    }).then((res) => {
      if (res.ok) {
        patchAuthState({ state: "authenticated", token: existingToken });
      } else {
        localStorage.removeItem(LocalStorageKey.AccessToken);
        patchAuthState({ state: "unauthenticated" });
      }
    });
  }, [patchAuthState]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthStatePatcherContext.Provider value={patchAuthState}>
        {children}
      </AuthStatePatcherContext.Provider>
    </AuthStateContext.Provider>
  );
}

export const AuthStateContext = createContext<AuthState>(initialAuthState);

export const AuthStatePatcherContext = createContext<AuthStatePatcher>((_) => {});
export type AuthStatePatcher = React.Dispatch<AuthStatePatcherAction>;

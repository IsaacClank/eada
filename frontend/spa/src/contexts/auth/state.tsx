import { createContext } from "react";

export interface AuthState {
  authenticated?: boolean;
  token?: string | null;
  user?: {
    email: string;
    normalizedEmail: string;
    sub: string;
  } | null;
}
export const AuthStateContext = createContext<AuthState>({});

export type AuthStateReducer = React.Dispatch<AuthStateReducerInput>;
export interface AuthStateReducerInput {
  state: "authenticated" | "unauthenticated";
  token?: string | null;
  loginCredentials?: {
    email: string;
    password: string;
  };
  user?: {
    email: string;
    normalizedEmail: string;
    sub: string;
  };
}
export const AuthStateReducerContext = createContext<AuthStateReducer>(_ => {});

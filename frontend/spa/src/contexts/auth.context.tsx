import { createContext, PropsWithChildren, useReducer } from "react";

export const AuthStateContext = createContext<AuthState>({});
export interface AuthState {
  authenticated?: boolean;
}

type AuthStatePatcher = React.Dispatch<AuthStatePatcherAction>;
export const AuthStatePatcherContext = createContext<AuthStatePatcher>((_) => {});
export interface AuthStatePatcherAction {
  type: "authenticated";
}

export function AuthContextProvider({ children }: PropsWithChildren) {
  const authStatePatcher = (state: AuthState, action: AuthStatePatcherAction) => {
    switch (action.type) {
      case "authenticated":
        return { ...state, authenticated: true };
      default:
        return state;
    }
  };

  const initialAuthState: AuthState = {
    authenticated: localStorage.getItem("accessToken") != null,
  };

  const [state, statePatcher] = useReducer(authStatePatcher, initialAuthState);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthStatePatcherContext.Provider value={statePatcher}>
        {children}
      </AuthStatePatcherContext.Provider>
    </AuthStateContext.Provider>
  );
}

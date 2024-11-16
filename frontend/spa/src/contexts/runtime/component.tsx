import { PropsWithChildren, useCallback } from "react";
import { HttpClientFactory } from "../../lib/http";
import { RuntimeContext } from "./state";

export function RuntimeContextProvider({ children }: PropsWithChildren) {
  const apiClientFactory = useCallback(
    () => new HttpClientFactory().baseAddress(import.meta.env.VITE_API_ADDRESS),
    [import.meta.env],
  );

  return (
    <RuntimeContext.Provider
      value={{
        apiClientFactory,
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
}

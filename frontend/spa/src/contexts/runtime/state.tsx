import { createContext } from "react";
import { HttpClientFactory } from "../../lib/http";

export interface Runtime {
  apiClientFactory: () => HttpClientFactory;
}

export const RuntimeContext = createContext<Runtime>({} as Runtime);

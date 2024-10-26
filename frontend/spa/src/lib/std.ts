export enum LocalStorageKey {
  AccessToken = "accessToken",
}

export interface BaseProps {
  className?: string;
}

export type AsyncAction = () => Promise<void>;

export interface UnknownObj {
  [key: string]: unknown;
}

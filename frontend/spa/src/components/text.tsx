import { BasePropsWithChildren } from "../lib/std";

export function H1({ children, className }: BasePropsWithChildren) {
  return <h1 className={className}>{children}</h1>;
}

export function H2({ children, className }: BasePropsWithChildren) {
  return <h2 className={className}>{children}</h2>;
}

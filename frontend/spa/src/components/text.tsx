import { BaseProps, BasePropsWithChildren } from "../lib/std";

export function H1({ children, className }: BasePropsWithChildren) {
  return <h1 className={`text-2xl ${className}`}>{children}</h1>;
}

export function H2({ children, className }: BasePropsWithChildren) {
  return <h2 className={className}>{children}</h2>;
}

export interface MoneyProps extends BaseProps {
  value: number;
}
export function PrettyNumber({ className, value }: MoneyProps) {
  const digitsInReverse = value.toString().split("").reverse();
  const formattedValue = [];

  for (let i = 0; i < digitsInReverse.length; i++) {
    if (i > 0 && i % 3 === 0) {
      formattedValue.unshift(",");
    }

    formattedValue.unshift(digitsInReverse[i]);
  }

  return <span className={className}>{formattedValue}</span>;
}

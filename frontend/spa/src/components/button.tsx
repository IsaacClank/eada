import { BasePropsWithChildren } from "../lib/std";

export interface ButtonProps extends BasePropsWithChildren {
  onClick?: () => void;
}

export function Button({ className, children, onClick }: ButtonProps) {
  return (
    <button
      onClick={e => {
        e.preventDefault();
        onClick && onClick();
      }}
      className={className + " flex justify-center items-center rounded-sm text-sm"}
    >
      {children ?? "Submit"}
    </button>
  );
}

import { BaseProps } from "../lib/std";

export interface ButtonProps extends BaseProps {
  label?: string;
  onClick?: () => void;
}

export function Button({ className, label, onClick }: ButtonProps) {
  return (
    <button
      onClick={e => {
        e.preventDefault();
        onClick && onClick();
      }}
      className={className + " flex justify-center items-center rounded-sm text-sm"}
    >
      {label ?? "Submit"}
    </button>
  );
}

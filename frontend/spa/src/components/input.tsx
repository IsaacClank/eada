import { HTMLInputTypeAttribute } from "react";

interface InputComponentProps {
  type?: HTMLInputTypeAttribute;
  className?: string;
  name?: string;
  required?: boolean;
}

export default function Input({ className, name, type, required }: InputComponentProps) {
  const defaultBackground = "bg-slate-200";
  const defaultWidth = "w-full";
  const defaultClassName = `${defaultBackground} ${defaultWidth}`;

  className = className?.length == 0 ? defaultClassName : `${defaultClassName} ${className}`;

  return <input name={name} type={type} className={className} required={required ?? false} />;
}

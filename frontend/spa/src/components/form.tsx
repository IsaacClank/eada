import { BaseProps } from "../lib/types";

interface SubmitFormProps extends BaseProps {
  value?: string;
}

export function SubmitForm({ className, value }: SubmitFormProps) {
  const defaultClassName = "bg-blue-300";
  className = className?.length === 0 ? defaultClassName : `${defaultClassName} ${className}`;
  return <input type="submit" value={value} className={className} />;
}

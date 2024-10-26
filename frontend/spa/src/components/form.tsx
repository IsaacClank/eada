import { BaseProps } from "../lib/std";

interface SubmitFormProps extends BaseProps {
  value?: string;
}

export function SubmitForm({ className, value }: SubmitFormProps) {
  const defaultClassName = "bg-blue-300";
  const defaultValue = "Submit";

  className = className?.length === 0 ? defaultClassName : `${defaultClassName} ${className}`;
  value ??= defaultValue;

  return <input type="submit" value={value} className={className} />;
}

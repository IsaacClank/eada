import { forwardRef, HTMLInputTypeAttribute } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { BaseProps } from "../lib/std";

interface SubmitFormProps extends BaseProps {
  value?: string;
}

export function SubmitForm({ className, value }: SubmitFormProps) {
  return (
    <input
      type="submit"
      value={value ?? "Submit"}
      className={`flex justify-center items-center rounded-sm text-sm cursor-pointer ${className}`}
    />
  );
}

interface InputProps {
  name?: string;
  label?: string;
  type?: HTMLInputTypeAttribute;
  className?: string;
  placeholder?: string;
  formConfig?: UseFormRegisterReturn;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, name, type, className, placeholder, formConfig }: InputProps, ref) => {
    return (
      <>
        {label && (
          <label htmlFor={name} className="text-white">
            {label}
          </label>
        )}

        <input
          name={name}
          type={type}
          className={`w-full bg-blue-200 rounded-sm px-2 py-1 ${className}`}
          placeholder={placeholder}
          ref={ref}
          {...formConfig}
        />
      </>
    );
  },
);

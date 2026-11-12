import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
};

export function FormField({ id, label, ...inputProps }: FormFieldProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 ml-1 block text-[0.8rem] font-semibold tracking-wide">
        {label}
      </label>
      <input id={id} name={id} className="field-input" {...inputProps} />
    </div>
  );
}

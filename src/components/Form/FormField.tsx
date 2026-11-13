import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string | undefined;
};

export function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 ml-1 block text-[0.8rem] font-semibold tracking-wide">
        {label}
      </label>
      <input id={id} name={id} className="field-input" aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined} {...inputProps} />
      {error && <p id={`${id}-error`} className="ml-1 mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

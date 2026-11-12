import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button.variants";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "nav";
  size?: "sm" | "md" | "lg" | "xl";
};

const validVariants = ["primary", "secondary", "accent", "nav"];
const validSizes = ["sm", "md", "lg", "xl"];

const Button = ({ children, className, variant, size, onClick, ...props }: ButtonProps) => {
  variant = variant || "primary";
  size = size || "md";
  className = className || "";
  if (!validVariants.includes(variant)) {
    console.warn(`Invalid variant "${variant}" provided. Defaulting to "primary".`);
    variant = "primary";
  }
  if (!validSizes.includes(size)) {
    console.warn(`Invalid size "${size}" provided. Defaulting to "md".`);
    size = "md";
  }
  return (
    <button
      className={cn(buttonVariants({ size, variant, className }))}
      onClick={onClick}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "cursor-pointer outline-none rounded-full select-none transition duration-200 disabled:cursor-default disabled:brightness-50",
  {
    variants: {
      variant: {
        nav: "flex items-center justify-center bg-transparent text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        primary: "bg-secondaryAccent text-white hover:bg-primaryAccent",
        secondary:
          "bg-transparent border-2 border-secondaryAccent text-secondaryAccent hover:bg-secondaryAccent hover:text-white",
        accent:
          "group flex items-center justify-center gap-2.5 bg-accent text-accent-foreground font-semibold hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-foreground",
      },
      size: {
        sm: "px-4 py-2 text-sm font-medium",
        md: "px-4 py-3 text-base font-medium",
        lg: "px-4 py-3 text-lg font-medium",
        xl: "px-6 py-4 text-[1.05rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        glow: "relative overflow-hidden",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
      glowColor?: string;
    }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps & { asChild?: boolean }>(
  ({ className, variant, size, asChild = false, glowColor, ...props }, ref) => {
    const Comp: React.ElementType = asChild ? "span" : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          variant === 'glow' && 'relative'
        )}
        ref={ref}
        {...props}
      >
        {variant === 'glow' && (
          <span
            className="absolute inset-0 rounded-full blur-lg opacity-60 transition-opacity duration-300"
            style={{ backgroundColor: glowColor || 'currentColor', filter: 'blur(10px)', zIndex: -1 }}
          />
        )}
        <span className="relative z-10">{props.children}</span>
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

// Added for the cn utility function type
type ClassValue = string | boolean | undefined | null | { [key: string]: ClassValue } | ClassValue[];
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: 
          "bg-electric-600 text-white shadow-lg shadow-electric-600/20 hover:bg-electric-500 hover:shadow-xl hover:shadow-electric-600/30 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90",
        outline:
          "border border-white/10 bg-surface-100 hover:bg-surface-200 hover:border-white/20 text-foreground",
        secondary:
          "bg-surface-200 text-foreground border border-white/5 hover:bg-surface-300 hover:border-white/10",
        ghost: 
          "text-muted-foreground hover:bg-surface-200 hover:text-foreground",
        link: 
          "text-electric-400 underline-offset-4 hover:underline",
        glow:
          "bg-electric-600 text-white shadow-glow hover:shadow-glow-lg hover:bg-electric-500 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
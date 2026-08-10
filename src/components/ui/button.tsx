import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/40 hover:shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-sm",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "bg-accent text-accent-foreground shadow-gold hover:bg-accent/88 hover:shadow-lg font-semibold tracking-wide",
        terracotta:
          "bg-terracotta text-terracotta-foreground shadow-sm hover:bg-terracotta/90 hover:shadow-md",
        onDark:
          "border border-ivory/60 text-ivory bg-ivory/8 backdrop-blur-sm hover:bg-ivory hover:text-forest-deep hover:shadow-md",
        cultural:
          "bg-gradient-to-r from-forest to-forest-light text-primary-foreground shadow-cultural hover:shadow-lg hover:from-forest-light hover:to-forest font-semibold",
        glass: "glass-surface text-foreground shadow-md hover:shadow-lg hover:bg-white/70",
        outlineGold:
          "border-2 border-accent text-accent bg-transparent hover:bg-accent hover:text-accent-foreground hover:shadow-gold font-semibold",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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

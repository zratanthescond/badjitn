import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold font-outfit ring-offset-background transition-all duration-300 ease-elite-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-elite-soft hover:bg-primary-hover hover:shadow-elite-glow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-elite-soft",
        outline:
          "border border-slate-200 dark:border-white/10 glass-control bg-transparent hover:bg-slate-200/50 dark:hover:bg-white/10 text-slate-900 dark:text-white shadow-elite-soft",
        secondary:
          "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 shadow-elite-soft",
        ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-200/30 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        elite: "bg-elite-gradient text-white shadow-elite-glow hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-3",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

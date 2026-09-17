import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Standard shadcn/ui `Button` primitive (the well-known, unmodified
 * boilerplate shape - cva variants, Slot-based `asChild` support).
 *
 * LIVES IN ITS OWN `components/shadcn/` FOLDER, NOT `components/ui/`:
 * this file used to sit at `components/ui/button.jsx`, right alongside
 * this app's own existing `components/ui/Button.jsx` (capital B). That
 * works fine on this sandbox's case-sensitive Linux filesystem, but
 * Windows and (by default) macOS use CASE-INSENSITIVE filesystems -
 * `button.jsx` and `Button.jsx` collapse into the SAME file on disk
 * there. Whichever one got written last "won," which is exactly what
 * broke `npm run dev` on Windows: every `import Button from
 * "../ui/Button"` across the app suddenly resolved to this shadcn
 * primitive (a named export, no default export) instead of the app's
 * own Button.jsx, producing "No matching export ... for import
 * default" for every single caller. Moving these three files to a
 * separate folder removes the naming collision entirely, independent
 * of filesystem case-sensitivity - no renaming scheme within `ui/`
 * (e.g. `button-shadcn.jsx`) would be as robust as just not sharing a
 * directory with the files it collides with.
 *
 * INTENTIONALLY SEPARATE from this app's own existing design system
 * (components/ui/Button.jsx) - that component has its own variant
 * names/props tuned to the rest of the site (primary/secondary/
 * outline/danger/ghost/link) and is used everywhere else in the app.
 * This file exists ONLY because liquid-metal-hero.jsx (adapted from the
 * shadcn/21st.dev ecosystem, which always assumes this exact primitive
 * shape) is written against it. Nothing outside the hero feature should
 * ever import from here - use the app's own Button.jsx everywhere else.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
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

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };

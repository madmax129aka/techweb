import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Standard shadcn/ui `Badge` primitive. See the file-level note in
 * `components/shadcn/button.jsx` for why this now lives in its own
 * `components/shadcn/` folder rather than `components/ui/` (a
 * Windows/macOS case-insensitive-filesystem collision with this app's
 * existing `components/ui/Badge.jsx`). Only liquid-metal-hero.jsx should
 * ever import this version - use the app's own Badge.jsx everywhere else.
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

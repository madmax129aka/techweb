import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn/ui `cn()` helper - merges any number of class-name
 * arguments (strings, arrays, conditional objects - whatever `clsx`
 * accepts) and then runs the result through `tailwind-merge` so
 * conflicting Tailwind utilities (e.g. two different `px-*` values)
 * resolve to "last one wins" instead of both ending up in the class
 * string. This exact implementation is the de facto standard used by
 * every shadcn/ui and 21st.dev component - reproduced here (rather than
 * generated via `npx shadcn@latest init`) because this sandbox has no
 * npm registry access to actually run that CLI.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

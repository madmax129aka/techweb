import React from "react";

// Thin, uppercase micro-labels (matching .nav-link-cinematic elsewhere)
// instead of a plain sentence-case label - the small premium-form detail
// used throughout the reference site's own forms.
export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11px] uppercase tracking-wider text-offwhite/55 font-medium mb-2">
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-sm bg-black/40 border border-crimson/25 px-3.5 py-2.5 text-offwhite placeholder-offwhite/30
        focus:border-arc focus:ring-1 focus:ring-arc outline-none transition-colors ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-sm bg-black/40 border border-crimson/25 px-3.5 py-2.5 text-offwhite placeholder-offwhite/30
        focus:border-arc focus:ring-1 focus:ring-arc outline-none transition-colors ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-sm bg-black/40 border border-crimson/25 px-3.5 py-2.5 text-offwhite
        focus:border-arc focus:ring-1 focus:ring-arc outline-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

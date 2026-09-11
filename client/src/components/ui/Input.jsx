import React from "react";

export function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-white/80 mb-1.5">
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg bg-black/40 border border-gold/20 px-3.5 py-2.5 text-white placeholder-white/40
        focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg bg-black/40 border border-gold/20 px-3.5 py-2.5 text-white placeholder-white/40
        focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg bg-black/40 border border-gold/20 px-3.5 py-2.5 text-white
        focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

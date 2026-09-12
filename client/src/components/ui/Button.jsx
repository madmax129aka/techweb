import React from "react";

const VARIANTS = {
  primary:
    "relative overflow-hidden bg-cta-gradient text-white font-bold shadow-crimson hover:shadow-crimson-lg border border-crimson-light/50 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]",
  secondary: "bg-arc text-onyx font-bold hover:bg-arc-light shadow-arc",
  outline: "border border-crimson/40 text-crimson-light hover:border-crimson hover:bg-crimson/10 bg-transparent",
  danger: "bg-danger text-white hover:bg-danger/80",
  ghost: "bg-transparent text-white hover:bg-white/10",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base tracking-wide",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold uppercase text-xs sm:text-sm
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      {...props}
    >
      {variant === "primary" && !disabled && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/3"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

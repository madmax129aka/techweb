import React from "react";

const VARIANTS = {
  primary:
    "relative overflow-hidden bg-gold-gradient text-onyx font-bold shadow-gold hover:shadow-gold-lg border border-gold-light/40",
  secondary: "bg-violet text-white hover:bg-violet/80",
  outline: "border border-gold/40 text-gold-light hover:border-gold hover:bg-gold/10 bg-transparent",
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

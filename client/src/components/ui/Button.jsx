import React from "react";

const VARIANTS = {
  primary: "bg-cyan text-base hover:bg-cyan-dim shadow-glow",
  secondary: "bg-violet text-white hover:bg-violet/80",
  outline: "border border-white/20 text-white hover:border-cyan hover:text-cyan bg-transparent",
  danger: "bg-danger text-white hover:bg-danger/80",
  ghost: "bg-transparent text-white hover:bg-white/10",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
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
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

import React from "react";

export default function Card({ children, className = "", glow = false, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`glass rounded-2xl p-6 ${glow ? "shadow-glow" : ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

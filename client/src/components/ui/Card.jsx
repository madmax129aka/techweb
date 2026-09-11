import React from "react";

export default function Card({ children, className = "", glow = false, hud = false, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`glass rounded-2xl p-6 ${glow ? "shadow-gold" : ""} ${hud ? "hud-corners" : ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

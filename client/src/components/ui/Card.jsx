import React from "react";

/**
 * Shared panel primitive. Recolored from the old gold-glow "glass" look
 * to the crimson/arc cinematic palette (the .glass CSS class itself is
 * already crimson-tinted, see index.css) so every page that still used
 * the default Card styling - Leaderboard, Login, Status, Cart,
 * VerifyCertificate, Dashboard, and every staff portal - picks up the
 * theme automatically instead of looking like a separate, older design.
 * Corners are squared off (rounded-sm) rather than heavily rounded,
 * matching the sharper-edged look of the rest of the cinematic UI.
 */
export default function Card({ children, className = "", glow = false, hud = false, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`glass rounded-sm p-6 ${glow ? "shadow-crimson" : ""} ${hud ? "hud-corners" : ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

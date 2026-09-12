import React, { useState } from "react";

/**
 * Drop-in replacement for the plain gradient <div>s used across the site
 * as image placeholders. Renders a real photo (via <img>, absolutely
 * positioned to fill its parent) with the same crimson/arc tint overlay
 * and hover-zoom treatment already used elsewhere, so photography reads
 * as part of the same dark cinematic system rather than a plain stock
 * photo dropped on top of it.
 *
 * Falls back to the original solid gradient look automatically if the
 * image URL 404s or otherwise fails to load - this matters because the
 * photo URLs (see lib/eventImages.js) were chosen without any way to
 * preview/verify them from this environment, so a broken-image icon is
 * avoided in favor of quietly keeping the previous gradient-only look.
 */
export default function CinematicImage({ src, alt = "", accent = "crimson", zoomOnHover = true, className = "" }) {
  const [failed, setFailed] = useState(false);

  const tintClass =
    accent === "crimson"
      ? "from-crimson/50 via-crimson/10"
      : "from-arc/35 via-arc/10";

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {!failed && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
            zoomOnHover ? "group-hover:scale-105" : ""
          }`}
        />
      )}
      {/* Dark tint overlay - always present (even over a real photo) so
          text stays legible and the palette stays consistent; becomes
          the entire visual (a plain gradient) when there's no image or
          it failed to load. */}
      <div className={`absolute inset-0 bg-gradient-to-t ${tintClass} to-transparent`} />
    </div>
  );
}

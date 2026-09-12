import React from "react";

/**
 * Minimal photo-moments page, kept in the same dark/cinematic language
 * as the rest of the public site. Placeholder tiles until real event
 * photography is added - swap the placeholder divs for <img> tiles once
 * photos exist.
 */
export default function Gallery() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4 text-center">Moments</p>
      <h1 className="font-serif text-3xl sm:text-5xl text-offwhite text-center mb-16">Gallery</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gradient-to-br from-crimson/15 via-transparent to-arc/10 flex items-center justify-center text-offwhite/25 text-xs uppercase tracking-cinematic"
          >
            Photo {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

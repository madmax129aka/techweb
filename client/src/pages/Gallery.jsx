import React from "react";
import CinematicImage from "../components/CinematicImage";
import { GALLERY_IMAGES } from "../lib/eventImages";

/**
 * Photo-moments page, kept in the same dark/cinematic language as the
 * rest of the public site. Uses generic themed stock photos (see
 * lib/eventImages.js) as a placeholder set - swap GALLERY_IMAGES for
 * your own uploaded event photography once it exists (either external
 * URLs or files under client/public/, both work the same way here).
 */
export default function Gallery() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4 text-center">Moments</p>
      <h1 className="font-serif text-3xl sm:text-5xl text-offwhite text-center mb-16">Gallery</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {GALLERY_IMAGES.map((src, i) => (
          <div key={i} className="relative aspect-square">
            <CinematicImage src={src} alt={`TechAstra moment ${i + 1}`} accent={i % 2 === 0 ? "crimson" : "arc"} />
          </div>
        ))}
      </div>
    </div>
  );
}

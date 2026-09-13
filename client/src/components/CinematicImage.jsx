import React, { useState } from "react";

/**
 * Drop-in replacement for the plain gradient <div>s used across the site
 * as image placeholders. Renders a real photo (via <img>, absolutely
 * positioned to fill its parent) with three independent layers on top of
 * it, each solving a different problem:
 *
 *   1. COLOR TINT (`accent`) - crimson/arc wash matching the site's
 *      palette. Purely decorative, NOT a contrast measure.
 *
 *   2. CONTRAST SCRIM (Section 5E, `scrim` prop, default "bottom") - a
 *      dedicated black gradient/overlay, completely independent of the
 *      color tint above, sized for where the *caller* actually places
 *      text over this image:
 *        - "bottom" (default): a gradient anchored to the bottom edge,
 *          ending at ~0.9 alpha black and easing to transparent - for the
 *          extremely common "title/price/time overlaid on the lower part
 *          of the image" pattern (event cards, Explore Further tiles).
 *          Height is `scrimHeight` (default 45% - comfortably more than
 *          the brief's "at least the bottom 35%"; callers with taller
 *          text stacks, e.g. Events.jsx cards, pass a taller value).
 *        - "full": a flat, even dark overlay across the ENTIRE image -
 *          for hero/banner sections where text is CENTERED rather than
 *          bottom-anchored (a bottom-only gradient would leave centered
 *          text sitting on unmodified photo pixels). Used on
 *          EventDetail's banner, which previously had no contrast
 *          treatment at all for its centered headline.
 *        - "none": no scrim layer - for purely decorative images with no
 *          text overlaid on them at all (Gallery's grid, EventDetail's
 *          side-by-side illustrative images), so they aren't needlessly
 *          darkened.
 *      This is the fix for the "price/seats text is nearly invisible"
 *      bug: that text was previously sitting directly on raw photo
 *      pixels with only the crimson color tint (layer 1, which can be
 *      quite light in its upper reaches) behind it.
 *
 *   3. LOAD FADE (Section 5G) - starts at opacity-0 over a solid `bg-void`
 *      placeholder (matching the dark theme, no spinner) and fades to
 *      opacity-100 once the <img> actually finishes loading, instead of
 *      popping in abruptly or showing a half-rendered image.
 *
 * Hover treatment (Section 5G): a subtle 1.0 -> 1.02 scale with a small
 * brightness lift, replacing the previous 5% zoom which read as too
 * aggressive at card scale. Opacity (load-in) and transform/filter
 * (hover) intentionally share one duration (400ms) rather than two - a
 * pragmatic middle ground that still sits inside the brief's 250-400ms
 * "every interactive state change" bucket for the hover response, while
 * staying close to the ~500ms called out for asset load-fades.
 *
 * Falls back to the original solid gradient look automatically if the
 * image URL 404s or otherwise fails to load - this matters because the
 * photo URLs (see lib/eventImages.js) were chosen without any way to
 * preview/verify them from this environment, so a broken-image icon is
 * avoided in favor of quietly keeping the previous gradient-only look.
 *
 * NOTE ON LAYOUT SHIFT: this component is always `absolute inset-0`,
 * filling whatever sized box its parent already reserves (e.g. the
 * `aspect-[4/5]` wrapper on Events.jsx cards) - so the "reserve exact
 * aspect-ratio space before it loads" requirement (Section 5G) is the
 * parent's responsibility. Every current caller already wraps this in a
 * fixed-aspect-ratio container, so there is zero layout shift when the
 * image swaps in.
 */
export default function CinematicImage({
  src,
  alt = "",
  accent = "crimson",
  zoomOnHover = true,
  scrim = "bottom", // "bottom" | "full" | "none"
  scrimHeight = "45%",
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const tintClass =
    accent === "crimson"
      ? "from-crimson/50 via-crimson/10"
      : "from-arc/35 via-arc/10";

  return (
    <div className={`absolute inset-0 overflow-hidden bg-void ${className}`}>
      {!failed && src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform,filter] duration-[400ms] ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          } ${zoomOnHover ? "group-hover:scale-[1.02] group-hover:brightness-110" : ""}`}
        />
      )}

      {/* Layer 1: color tint - part of the site's palette, not a contrast measure */}
      <div className={`absolute inset-0 bg-gradient-to-t ${tintClass} to-transparent`} />

      {/* Layer 2 (Section 5E): contrast scrim for any text overlaid on
          this image - deliberately separate from the color tint above,
          and on by default ("bottom"), since "raw photo pixels behind
          text" is exactly the bug being fixed here. */}
      {scrim === "bottom" && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: scrimHeight,
            background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 55%, transparent 100%)",
          }}
        />
      )}
      {scrim === "full" && (
        <div className="absolute inset-0 pointer-events-none bg-black/55" />
      )}
    </div>
  );
}

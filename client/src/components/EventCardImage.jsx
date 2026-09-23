import React, { useState } from "react";

/**
 * Shared icon-first, photo-fallback card image - the SAME resolution
 * logic used by both the main Events page carousel (EventsCoverFlow)
 * and the Event Detail page's "Other Events to Explore" grid (Section 6
 * of EventDetail.jsx), so there's exactly one place this logic lives
 * rather than two separate implementations that can silently drift out
 * of sync (which is exactly what happened before this component
 * existed - EventsCoverFlow had its own inline `CardImage`, and the
 * "Other Events to Explore" grid never got the same treatment at all,
 * still calling the plain stock-photo-only `CinematicImage`).
 *
 * Tries `iconSrc` (from `getEventIconSrc()` in lib/eventImages.js)
 * first; if that 404s (or no icon is mapped for this event yet -
 * `iconSrc` is `null`), falls back to `photoSrc` (the existing
 * stock/Picsum photo from `getEventImage()`).
 *
 * Icons are small/centered emblems, not full-bleed photography, so they
 * render `object-fit: contain`, centered, with padding, on a flat
 * background behind them (see `iconBackgroundClassName`) - NOT
 * stretched/cropped edge-to-edge the way the photo fallback is. The
 * photo fallback keeps the original full-bleed `object-fit: cover`
 * treatment unchanged.
 *
 * `iconPadding` lets callers with a different card aspect ratio (the
 * carousel's tall 330x500 cards vs Section 6's `aspect-[3/4]` grid
 * cards) tune how much breathing room the icon gets without needing a
 * second component.
 *
 * `iconBackgroundClassName` (default `"bg-surface"`) lets callers that
 * are NOT a standalone card (e.g. an icon embedded directly on a
 * page's own already-dark background) opt out of the dark box behind
 * the icon by passing `""` - see EventScrollFeatureSection.jsx.
 */
export default function EventCardImage({
  iconSrc,
  photoSrc,
  alt,
  eager = false,
  iconPadding = "48px",
  // Defaults to the site's `surface` token (#1A0505) - matches the
  // Events grid carousel and "Other Events to Explore" cards, which
  // need the icon to stand out against a busy image-filled card box.
  // Callers embedded directly in a section's own page background
  // (EventScrollFeatureSection.jsx's "The Event"/"Rules & Format"
  // panels) pass "" instead - there, a second dark box behind the icon
  // is a redundant, unwanted frame floating on top of the page's own
  // background, not a card that needs to visually stand out.
  iconBackgroundClassName = "bg-surface",
  className = "",
}) {
  const [iconFailed, setIconFailed] = useState(false);
  const showIcon = !!iconSrc && !iconFailed;

  if (showIcon) {
    return (
      <div
        className={`absolute inset-0 flex items-center justify-center ${iconBackgroundClassName} ${className}`}
        style={{ padding: iconPadding }}
      >
        <img
          src={iconSrc}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onError={() => setIconFailed(true)}
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
      </div>
    );
  }

  if (!photoSrc) return null;

  return (
    <img
      src={photoSrc}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
    />
  );
}

/**
 * SECTION 5F - per-event promotional video mapping.
 *
 * HONESTY NOTE (read this before wiring in real assets): this sandbox
 * has no video-generation tool and no way to render/preview media at
 * all, so NO actual .mp4 files have been created or added to this repo.
 * What exists here is the PLUMBING the brief asked for - a slug-based
 * lookup + a lazy-loading, muted/looped <video> component with a poster
 * fallback (see components/EventHeroMedia.jsx) - wired up so that
 * dropping real files into client/public/videos/ using the exact
 * filenames below is the ONLY step left to turn this on. Until those
 * files exist, every event simply falls back to its existing static
 * banner image (getEventImage in eventImages.js) via the <video>'s
 * onError handler - there is no broken-video icon or dead space.
 *
 * TO ADD A REAL VIDEO: generate/source a short (5-10s) muted, seamlessly
 * loopable clip representing the event's theme, compress it to under
 * ~3-5MB (e.g. `ffmpeg -i in.mp4 -vcodec libx264 -crf 28 -an out.mp4` -
 * `-an` strips audio, which is dropped anyway since playback is always
 * muted), and save it as client/public/videos/<slug>.mp4 using the exact
 * slug this file generates for that event name (see `slugify` below, or
 * just log `getEventVideoSrc(event.name)` for the exact expected path).
 */

/** Matches the event's `name` field to a filename-safe slug, e.g. "Robo Race" -> "robo-race". */
function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns the local path a video for this event WOULD load from, if one
 * has been added. Always returns a path (never null) - EventHeroMedia is
 * responsible for silently falling back to the static image if this
 * specific file doesn't actually exist on disk (404).
 */
export function getEventVideoSrc(eventName) {
  return `/videos/${slugify(eventName)}.mp4`;
}

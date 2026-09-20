/**
 * SECTION 5F - per-event promotional video mapping.
 *
 * REAL FILES CONFIRMED ON DISK (client/public/videos/, via an actual
 * directory listing - not assumed) as of this pass:
 *   Technical Events:
 *     Code Rescue.mp4
 *     Crypt Clash.mp4
 *     Forensic Alibi.mp4
 *     hack-nexus.mp4
 *     Pen your Vision.mp4
 *     Pixel Protocol.mp4
 *     Trials of Truth.mp4
 *   Non-Technical Events (including Esports):
 *     70mm decode.mp4
 *     blitz hunt.mp4
 *     cap chaos.mp4
 *     clash squad esports.mp4
 *     plot twist.mp4
 *     rythm riot.mp4
 *     team fued.mp4
 *     verbal combat.mp4
 *
 * WHY THIS IS AN EXPLICIT MAP, NOT A DERIVED SLUG PATH (same reasoning,
 * same bug class, as the icon filename map in lib/eventImages.js):
 * these filenames don't consistently follow one convention against the
 * real event names in the DB -
 *   - "hack-nexus.mp4" is slug-style (lowercase, hyphenated)
 *   - the other files use the real event name WITH SPACES, but with
 *     inconsistent capitalization ("Pen your Vision.mp4" - lowercase
 *     "your" - vs the DB name "Pen Your Vision")
 *   - "Trials of Truth.mp4" is even a different WORD than the DB event
 *     name, "Trial of Truth" (singular "Trial") - not just a casing
 *     difference, an actual spelling/pluralization difference, so no
 *     case-insensitive compare or slugify() rule can derive one from
 *     the other
 * A lookup table keyed by the exact `event.name` is the only reliable
 * option here, matching the pattern already used for EVENT_ICON_FILES.
 *
 * Any event NOT in this map (or not yet matching it) falls back to
 * `hack-nexus.mp4` as a placeholder - this is the SAME "every event
 * temporarily plays Hack Nexus's clip" behavior already in place, just
 * now scoped to only the events that don't have their own real video
 * yet, instead of applying to every event unconditionally.
 */
const EVENT_VIDEO_FILES = {
  // Technical Events
  "Code Rescue": "Code Rescue.mp4",
  "Crypt Clash": "Crypt Clash.mp4",
  "Forensic Alibi": "Forensic Alibi.mp4",
  "Hack Nexus": "hack-nexus.mp4",
  "Pen Your Vision": "Pen your Vision.mp4",
  "Pixel Protocol": "Pixel Protocol.mp4",
  "Trial of Truth": "Trials of Truth.mp4", // file is "Trials" (plural) - DB event name is "Trial" (singular), a real spelling difference, not just casing
  
  // Non-Technical Events (including Esports)
  "Rythm Riot": "rythm riot.mp4",
  "70MM Decode": "70mm decode.mp4",
  "Verbal Combat": "verbal combat.mp4",
  "Blitz Hunt": "blitz hunt.mp4",
  "Plot Twist": "plot twist.mp4",
  "Team Fued": "team fued.mp4",
  "Cap Chaos": "cap chaos.mp4",
  "Clash Squad Esports": "clash squad esports.mp4",
};

const FALLBACK_VIDEO_FILE = "hack-nexus.mp4";

/** Matches the event's `name` field to a filename-safe slug, e.g. "Robo Race" -> "robo-race". Still used for slug-style asset lookups elsewhere (e.g. lib/eventImages.js's video-adjacent icon paths) even though video resolution itself is now the explicit map above. */
export function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns the local path to this event's REAL video if one has been
 * uploaded (per EVENT_VIDEO_FILES above), or the hack-nexus.mp4
 * placeholder otherwise. Always returns a path (never null) -
 * EventHeroMedia additionally falls back to the static image if even
 * this resolved file 404s (e.g. a typo in the map, or the file gets
 * removed later), so there's still no broken-video icon or dead space
 * in the worst case.
 */
export function getEventVideoSrc(eventName) {
  const file = EVENT_VIDEO_FILES[eventName] || FALLBACK_VIDEO_FILE;
  return `/videos/${file}`;
}

/** True if this event has its OWN real uploaded video (not the hack-nexus.mp4 placeholder) - lets callers distinguish "real video" from "temporary fallback" without re-deriving the map's logic themselves (e.g. for a status readout). */
export function hasOwnEventVideo(eventName) {
  return Object.prototype.hasOwnProperty.call(EVENT_VIDEO_FILES, eventName);
}

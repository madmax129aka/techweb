/**
 * Central mapping of event/section name -> a themed photo URL.
 *
 * WHY THIS FILE EXISTS: every image on the public pages was a plain CSS
 * gradient standing in for a photo. Rather than hardcoding image URLs
 * inside every page component, they're collected here in one place so
 * any single photo can be swapped (or replaced with your own uploaded
 * asset under client/public/) by editing exactly one line.
 *
 * HONESTY NOTE ON THESE SPECIFIC URLS: this sandbox has no way to
 * preview/render images, so these were picked as well-known, commonly
 * referenced Unsplash photos matching each theme - they have NOT been
 * visually verified by the agent that wrote this file. Every place that
 * uses these (see components/CinematicImage.jsx) automatically falls
 * back to the original gradient look if a URL ever fails to load, so a
 * bad pick degrades gracefully instead of showing a broken-image icon -
 * but you should still open the site and swap out anything that looks
 * wrong or off-theme.
 *
 * EVENT LIST UPDATE (final official list, replacing the earlier 8-event
 * placeholder set): the keys below were remapped to the 15 finalized
 * event names - 8 Technical + 7 Non-Technical. Six of them reuse the
 * SAME already-integrated photo IDs from the previous placeholder list
 * where the new event's theme is a close match to the old one (e.g.
 * "Hack Nexus" is still a hackathon, so it keeps the old "Hackathon"
 * photo) - those specific IDs are already proven to load correctly
 * elsewhere in this app. The remaining nine have no close analog in the
 * old list, so they're flagged individually below with "NEW - UNVERIFIED"
 * - swap those out first if anything looks off-theme.
 *
 * Format used: Unsplash's permanent CDN photo URL
 * (images.unsplash.com/photo-<id>), NOT source.unsplash.com - that
 * keyword-based "random photo" service was fully shut down in 2024 and
 * no longer works at all.
 *
 * TO SWAP A PHOTO: replace the URL string for that key below. To use
 * your own uploaded photo instead of an external URL, put the file in
 * client/public/events/<name>.jpg and set the value to "/events/<name>.jpg".
 */

const UNSPLASH = (id, w = 1200, q = 80) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/** Keyed by the event's `name` field exactly as it comes back from the API. */
export const EVENT_IMAGES = {
  // ---- TECHNICAL (8) ----
  "Pen Your Vision": UNSPLASH("1475721027785-f74eccf877e2"), // presenting at a table with laptops (carried over from "Paper Presentation")
  "Hack Nexus": UNSPLASH("1522202176988-66273c2fd55f"), // team huddled around a laptop (carried over from "Hackathon")
  "Crypt Clash": UNSPLASH("1555949963-aa79dcee981c"), // NEW - UNVERIFIED - lock/code screen, cybersecurity theme
  "Trial of Truth": UNSPLASH("1524178232363-1fb2b075b655"), // classroom / hands raised (carried over from "Tech Quiz")
  "Code Rescue": UNSPLASH("1517694712202-14dd9538aa97"), // code on screen (carried over from "Coding Marathon")
  "Pixel Protocol": UNSPLASH("1467232004584-a241de8bcf5d"), // code editor, blue tones (carried over from "Web Design Contest")
  "Forensic Alibi": UNSPLASH("1453873531674-2151bcd01707"), // NEW - UNVERIFIED - magnifying glass / investigation
  "Prompt Arena": UNSPLASH("1531297484001-80022131f5a1"), // NEW - UNVERIFIED - AI / neural network abstract

  // ---- NON-TECHNICAL (7) ----
  "Rythm Riot": UNSPLASH("1508700115892-45ecd05ae2ad"), // NEW - UNVERIFIED - dance performance / stage lights
  "70MM Decode": UNSPLASH("1517604931442-7e0c8ed2963c"), // NEW - UNVERIFIED - cinema screen / theater
  "Verbal Combat": UNSPLASH("1475721027785-f74eccf877e2"), // NEW - UNVERIFIED - podium/speaking (reuses paper-presentation photo as a stand-in)
  "Blitz Hunt": UNSPLASH("1533230408708-8f9f91d1235a"), // map / compass / exploration (carried over from "Treasure Hunt")
  "Plot Twist": UNSPLASH("1503095396549-807759245b35"), // NEW - UNVERIFIED - stage/theatre performance
  "Team Fued": UNSPLASH("1517245386807-bb43f82c33c4"), // NEW - UNVERIFIED - group buzzer/game-show energy
  "Cap Chaos": UNSPLASH("1611162617213-7d7a6f747cee"), // NEW - UNVERIFIED - meme/laptop-editing/creative energy
};

/**
 * Generic cover images for the mega-menu's category headers
 * (Section 5D). Shown on the right image panel when a user hovers
 * "Technical" / "Non-Technical" before drilling into a specific event.
 */
export const CATEGORY_IMAGES = {
  technical: UNSPLASH("1518770660439-4636190af475", 1600, 75), // circuit board / hardware
  non_technical: UNSPLASH("1523580494863-6f3031224c94", 1600, 75), // audience / crowd energy
};

/** Generic fallback for any event name not explicitly mapped above (e.g. once real events replace the seed data). */
export const DEFAULT_EVENT_IMAGE = UNSPLASH("1519389950473-47ba0277781c");

/**
 * Generic cover/backdrop imagery used across this Registration Portal
 * app's own pages - NOT a homepage hero carousel (this app has no
 * homepage of its own; that lives on the separate main marketing site
 * per the scope correction). Current uses:
 *   - `intro`  - Login.jsx's split-screen photo backdrop
 *   - `flagship` - FullScreenMenu's generic cover for "Events" (before
 *      drilling into Technical/Non-Technical) and "My Dashboard"/"Help
 *      Desk" rows
 *   - `registrations` - FullScreenMenu's cover for "Verify Certificate"
 */
export const HERO_IMAGES = {
  intro: UNSPLASH("1540575467063-178a50c2df87", 1920, 75), // symposium/auditorium crowd
  flagship: UNSPLASH("1522202176988-66273c2fd55f", 1920, 75), // hackathon energy
  registrations: UNSPLASH("1521737711867-e3b97375f902", 1920, 75), // event/registration desk energy
};

export function getEventImage(eventName) {
  return EVENT_IMAGES[eventName] || DEFAULT_EVENT_IMAGE;
}

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
  "Coding Marathon": UNSPLASH("1517694712202-14dd9538aa97"), // code on screen
  "Paper Presentation": UNSPLASH("1475721027785-f74eccf877e2"), // presenting at a table with laptops
  Hackathon: UNSPLASH("1522202176988-66273c2fd55f"), // team huddled around a laptop
  "Tech Quiz": UNSPLASH("1524178232363-1fb2b075b655"), // classroom / hands raised
  "Robo Race": UNSPLASH("1485827404703-89b55fcc595e"), // robotic arm
  "Web Design Contest": UNSPLASH("1467232004584-a241de8bcf5d"), // code editor, blue tones
  "Poster Presentation": UNSPLASH("1531482615713-2afd69097998"), // exhibition / conference hall
  "Startup Pitch": UNSPLASH("1519389950473-47ba0277781c"), // team meeting around a table
};

/** Generic fallback for any event name not explicitly mapped above (e.g. once real events replace the seed data). */
export const DEFAULT_EVENT_IMAGE = UNSPLASH("1519389950473-47ba0277781c");

/** Homepage hero carousel - one wide shot per slide. */
export const HERO_IMAGES = {
  intro: UNSPLASH("1540575467063-178a50c2df87", 1920, 75), // symposium/auditorium crowd
  flagship: UNSPLASH("1522202176988-66273c2fd55f", 1920, 75), // hackathon energy
  registrations: UNSPLASH("1521737711867-e3b97375f902", 1920, 75), // event/registration desk energy
};

/** Gallery page - a handful of generic "past editions" moment shots. */
export const GALLERY_IMAGES = [
  UNSPLASH("1540575467063-178a50c2df87", 800, 70),
  UNSPLASH("1522202176988-66273c2fd55f", 800, 70),
  UNSPLASH("1475721027785-f74eccf877e2", 800, 70),
  UNSPLASH("1531482615713-2afd69097998", 800, 70),
  UNSPLASH("1519389950473-47ba0277781c", 800, 70),
  UNSPLASH("1485827404703-89b55fcc595e", 800, 70),
  UNSPLASH("1467232004584-a241de8bcf5d", 800, 70),
  UNSPLASH("1517694712202-14dd9538aa97", 800, 70),
  UNSPLASH("1524178232363-1fb2b075b655", 800, 70),
];

export function getEventImage(eventName) {
  return EVENT_IMAGES[eventName] || DEFAULT_EVENT_IMAGE;
}

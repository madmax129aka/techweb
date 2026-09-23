/**
 * SECTION 2 helper for the Event Detail page ("The Statement" - the
 * full-100vh, plain-background, large-serif editorial block modeled on
 * Phantom's "For over a century, Phantom has embodied..." block).
 *
 * There is no AI text-generation tool in this environment, and no
 * separate "statement" field on the Event model - so rather than
 * hardcoding one bespoke sentence per event (which silently goes stale
 * the moment an event's description is edited, and doesn't scale to new
 * events added later), this derives the statement FROM the event's real
 * `description` field, deterministically, every time.
 *
 * Rule: take the first sentence (up to and including the first
 * terminal punctuation mark: . ! or ?). If the description has no
 * sentence break at all (a single short phrase with no terminal
 * punctuation), the whole description is used as-is - nothing is ever
 * truncated mid-word or mid-thought.
 */
export function getEventStatement(description) {
  if (!description || typeof description !== "string") return "";

  const trimmed = description.trim();
  if (!trimmed) return "";

  // Match everything up to and including the first ./!/? - `[^.!?]*`
  // rather than a greedy `.*` so this stops at the FIRST terminator, not
  // the last one in the whole string.
  const match = trimmed.match(/^[^.!?]*[.!?]/);
  return match ? match[0].trim() : trimmed;
}

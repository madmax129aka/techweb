import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import CinematicImage from "../components/CinematicImage";
import { getEventImage } from "../lib/eventImages";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

function formatTime(iso) {
  return new Date(iso).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

/**
 * Events page, restyled to match the rest of the "Rolls-Royce cinematic"
 * site instead of the old boxed-card SaaS look: a quiet header section,
 * then a grid of large, borderless, image-led cards (same visual language
 * as Home.jsx's "Explore Further" row). Each card is fully clickable
 * through to the event's story page (EventDetail, /events/:id); Add/Remove
 * from Cart is a separate control in the card footer so it isn't nested
 * inside the card's own link.
 */
const CATEGORY_FILTERS = [
  { key: "all", label: "All Events" },
  { key: "technical", label: "Technical" },
  { key: "non_technical", label: "Non-Technical" },
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { items, addItem, removeItem } = useCart();

  useEffect(() => {
    api
      .get("/api/events")
      .then((data) => setEvents(data.events || []))
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  const inCart = (id) => items.some((i) => i.id === id);

  // Reuse the same `category` field that drives the mega-menu split, so
  // the Technical/Non-Technical distinction is consistent everywhere.
  const visibleEvents =
    categoryFilter === "all"
      ? events
      : events.filter(
          (e) => (e.category === "non_technical" ? "non_technical" : "technical") === categoryFilter
        );

  const handleAdd = (event) => {
    const result = addItem(event);
    if (!result.ok) {
      toast.error(result.reason);
    } else {
      toast.success(`${event.name} added to cart`);
    }
  };

  const handleRemove = (event) => {
    removeItem(event.id);
    toast.success(`${event.name} removed from cart`);
  };

  return (
    <div>
      {/* Header */}
      <section className="border-b border-crimson/10 py-20 sm:py-28 text-center px-6">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Eight Tracks. One Day.</p>
        <h1 className="font-serif text-3xl sm:text-5xl text-offwhite mb-5">Events</h1>
        <p className="text-offwhite/55 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-10">
          Times are shown so clashes are obvious at a glance &mdash; adding an event that overlaps
          one already in your cart is blocked automatically.
        </p>

        {/* Technical / Non-Technical filter - same category split as the
            mega-menu. Understated text tabs, not filled buttons, to match
            the cinematic language. */}
        <div className="flex items-center justify-center gap-8">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setCategoryFilter(f.key)}
              className={`text-[11px] tracking-cinematic uppercase pb-2 border-b transition-colors ${
                categoryFilter === f.key
                  ? "text-arc border-arc"
                  : "text-offwhite/50 border-transparent hover:text-offwhite"
              }`}
              data-log={`events-filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <p className="text-offwhite/50 text-center py-20">Loading events...</p>
      )}

      {!loading && visibleEvents.length === 0 && (
        <p className="text-offwhite/50 text-center py-20">No events in this category yet.</p>
      )}

      {/* Card grid - large, borderless, image-led, matching Explore Further */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {visibleEvents.map((event, i) => {
          const full = event.seatsAvailable <= 0;
          const added = inCart(event.id);
          const accent = i % 2 === 0 ? "crimson" : "arc";

          return (
            <div
              key={event.id}
              className="group relative flex flex-col border-r border-b border-crimson/10"
            >
              <Link
                to={`/events/${event.id}`}
                className="relative aspect-[4/5] overflow-hidden block"
                data-log={`events-card-open-${event.id}`}
              >
                <CinematicImage src={getEventImage(event.name)} alt={event.name} accent={accent} />

                {event.isTeamEvent && (
                  <span className="absolute top-5 right-5 text-[10px] uppercase tracking-cinematic text-offwhite/70 border border-offwhite/20 px-2 py-1">
                    Team
                  </span>
                )}

                <div className="absolute inset-0 flex flex-col items-start justify-end p-6 sm:p-8">
                  <p className="text-[10px] tracking-cinematic uppercase text-arc mb-2">
                    {event.track || "General"}
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl text-offwhite mb-2">{event.name}</h3>
                  <p className="text-offwhite/55 text-xs sm:text-sm leading-relaxed mb-4 max-w-[240px] line-clamp-2">
                    {event.description}
                  </p>
                  <div className="text-offwhite/45 text-[11px] space-y-0.5 mb-3">
                    <p>{formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}</p>
                    <p>{event.venue || "Venue TBA"}</p>
                  </div>
                  <span className="text-[10px] tracking-cinematic uppercase text-arc opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Details &rarr;
                  </span>
                </div>
              </Link>

              {/* Footer - price, seats, cart control. Deliberately a sibling
                  of the Link above (not nested inside it) so the Add/Remove
                  button stays its own clickable target. */}
              <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 bg-void">
                <div>
                  <p className="font-serif text-lg text-offwhite">&#8377;{event.fee}</p>
                  <p className="text-offwhite/40 text-[11px]">
                    {full ? "Seats full" : `${event.seatsAvailable} of ${event.maxSeats} left`}
                  </p>
                </div>

                {added ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(event)}
                    data-log={`events-remove-cart-${event.id}`}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={full}
                    onClick={() => handleAdd(event)}
                    data-log={`events-add-cart-${event.id}`}
                  >
                    {full ? "Full" : "Add to Cart"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

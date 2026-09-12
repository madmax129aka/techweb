import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import CinematicImage from "../components/CinematicImage";
import { getEventImage } from "../lib/eventImages";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { usePanels } from "../context/PanelContext";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "rules", label: "Rules" },
  { key: "register", label: "Register" },
];

function formatTime(iso) {
  return new Date(iso).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

/**
 * Event story page, modeled on the Rolls-Royce "model page" pattern: a
 * persistent sub-nav under the header (event name + Overview|Rules|
 * Register tabs that scroll-jump within the same page, mirroring how the
 * reference site's own model sub-nav works), a full-bleed banner with one
 * bold statement line, alternating image+text sections, and a closing
 * "Continue Your Journey" row linking to other events.
 */
export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [otherEvents, setOtherEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { items, addItem } = useCart();
  const { openPanel } = usePanels();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/events/${id}`)
      .then((data) => setEvent(data.event))
      .catch(() => toast.error("Could not load this event"))
      .finally(() => setLoading(false));

    api
      .get("/api/events")
      .then((data) => setOtherEvents((data.events || []).filter((e) => e.id !== id).slice(0, 3)))
      .catch(() => {});
  }, [id]);

  const inCart = event ? items.some((i) => i.id === event.id) : false;
  const full = event ? event.seatsAvailable <= 0 : false;

  const handleRegister = () => {
    if (!event) return;
    if (!inCart) {
      const result = addItem(event);
      if (!result.ok) {
        toast.error(result.reason);
        return;
      }
    }
    openPanel("registration");
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-24 text-center text-offwhite/50">Loading event...</div>;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-offwhite/60 mb-6">This event could not be found.</p>
        <Link to="/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Sub-nav: event name + Overview | Rules | Register tabs */}
      <div className="sticky top-[76px] z-30 bg-void/95 backdrop-blur-md border-b border-crimson/15">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14 overflow-x-auto">
          <span className="font-heading text-sm text-offwhite whitespace-nowrap mr-8">{event.name}</span>
          <div className="flex items-center gap-6 sm:gap-8">
            {TABS.map((tab) => (
              <a
                key={tab.key}
                href={`#${tab.key}`}
                className="nav-link-cinematic whitespace-nowrap"
                data-log={`event-tab-${tab.key}`}
              >
                {tab.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Full-bleed banner with one bold statement line */}
      <section className="section-cinematic min-h-[70vh]" id="overview">
        <CinematicImage src={getEventImage(event.name)} alt={event.name} zoomOnHover={false} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center animate-cinematic-fade">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-5">{event.track || "General"}</p>
          <h1 className="font-serif text-4xl sm:text-6xl text-offwhite leading-tight">{event.name}</h1>
        </div>
      </section>

      {/* Alternating image+text: description */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid sm:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/3] order-2 sm:order-1">
          <CinematicImage src={getEventImage(event.name)} alt={event.name} accent="crimson" zoomOnHover={false} />
        </div>
        <div className="order-1 sm:order-2">
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">The Event</p>
          <p className="text-offwhite/70 text-base leading-relaxed">{event.description}</p>
          <div className="mt-6 space-y-1 text-sm text-offwhite/50">
            <p>{formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}</p>
            <p>{event.venue || "Venue TBA"}</p>
            {event.isTeamEvent && <p>Team event</p>}
          </div>
        </div>
      </section>

      {/* Alternating image+text: rules */}
      <section id="rules" className="max-w-5xl mx-auto px-6 py-24 grid sm:grid-cols-2 gap-12 items-center border-t border-crimson/10">
        <div>
          <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Rules &amp; Format</p>
          <p className="text-offwhite/70 text-base leading-relaxed whitespace-pre-line">
            {event.rulebook || "Full rules will be shared closer to the event date."}
          </p>
        </div>
        <div className="relative aspect-[4/3]">
          <CinematicImage src={getEventImage(event.name)} alt={event.name} accent="arc" zoomOnHover={false} />
        </div>
      </section>

      {/* Register */}
      <section id="register" className="max-w-3xl mx-auto px-6 py-24 text-center border-t border-crimson/10">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Register</p>
        <p className="font-serif text-3xl sm:text-4xl text-offwhite mb-3">&#8377;{event.fee}</p>
        <p className="text-offwhite/50 text-sm mb-10">
          {event.seatsAvailable} of {event.maxSeats} seats remaining
        </p>
        <Button
          size="lg"
          disabled={full}
          onClick={handleRegister}
          data-log="event-detail-register"
        >
          {full ? "Seats Full" : inCart ? "Continue to Registration" : "Register for This Event"}
        </Button>
      </section>

      {/* Continue Your Journey */}
      {otherEvents.length > 0 && (
        <section className="border-t border-crimson/10 py-20">
          <div className="max-w-6xl mx-auto px-6 mb-12 text-center">
            <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Continue Your Journey</p>
            <h2 className="font-serif text-2xl sm:text-4xl text-offwhite">Other Events to Explore</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3">
            {otherEvents.map((e) => (
              <Link
                key={e.id}
                to={`/events/${e.id}`}
                className="group relative aspect-[4/5] overflow-hidden border-r border-b border-crimson/10 last:border-r-0"
                data-log={`continue-journey-${e.id}`}
              >
                <CinematicImage src={getEventImage(e.name)} alt={e.name} accent="crimson" />
                <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                  <h3 className="font-serif text-lg sm:text-xl text-offwhite mb-2">{e.name}</h3>
                  <span className="text-[10px] tracking-cinematic uppercase text-arc opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Discover More &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

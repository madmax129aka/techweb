import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";

function formatTime(iso) {
  return new Date(iso).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rulebookEvent, setRulebookEvent] = useState(null);
  const { items, addItem } = useCart();

  useEffect(() => {
    api
      .get("/api/events")
      .then((data) => setEvents(data.events || []))
      .catch(() => toast.error("Failed to load events"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (event) => {
    const result = addItem(event);
    if (!result.ok) {
      toast.error(result.reason);
    } else {
      toast.success(`${event.name} added to cart`);
    }
  };

  const inCart = (id) => items.some((i) => i.id === id);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold mb-2">Events</h1>
      <p className="text-white/60 mb-8">
        Times are shown so clashes are obvious at a glance — the cart will block you from adding two overlapping events.
      </p>

      {loading && <p className="text-white/50">Loading events...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const full = event.seatsAvailable <= 0;
          return (
            <Card key={event.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-violet">{event.track || "General"}</span>
                {event.isTeamEvent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">Team Event</span>
                )}
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">{event.name}</h3>
              <p className="text-sm text-white/60 mb-3 flex-1">{event.description}</p>

              <div className="text-sm text-white/70 mb-3 space-y-1">
                <p>🕒 {formatTime(event.startTime)} — {formatTime(event.endTime)}</p>
                <p>📍 {event.venue || "TBA"}</p>
                <p>💺 {event.seatsAvailable} / {event.maxSeats} seats left</p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-cyan font-bold text-lg">₹{event.fee}</span>
                {event.rulebook && (
                  <button
                    className="text-xs text-white/60 hover:text-cyan underline"
                    onClick={() => setRulebookEvent(event)}
                  >
                    Rulebook
                  </button>
                )}
              </div>

              <Button
                variant={inCart(event.id) ? "outline" : "primary"}
                disabled={full || inCart(event.id)}
                onClick={() => handleAdd(event)}
                className="w-full"
              >
                {full ? "Seats Full" : inCart(event.id) ? "In Cart" : "Add to Cart"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Modal open={!!rulebookEvent} onClose={() => setRulebookEvent(null)} title={rulebookEvent?.name + " — Rulebook"}>
        <p className="text-white/80 text-sm whitespace-pre-line">{rulebookEvent?.rulebook}</p>
      </Modal>
    </div>
  );
}

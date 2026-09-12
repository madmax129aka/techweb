import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { useCart } from "../context/CartContext";
import { usePanels } from "../context/PanelContext";

/**
 * Cinematic list layout: borderless rows separated by thin crimson
 * dividers instead of stacked boxed Cards, matching the Leaderboard/
 * Status treatment. Logic (removeItem/openPanel/total) is untouched.
 */
export default function Cart() {
  const { items, removeItem, total } = useCart();
  const { openPanel } = usePanels();

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="text-center mb-14 animate-cinematic-fade">
        <p className="text-arc text-[11px] tracking-cinematic uppercase mb-4">Your Selections</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-offwhite">Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border-t border-b border-crimson/10">
          <p className="text-offwhite/50 mb-6">Your cart is empty.</p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-crimson/10 border-t border-b border-crimson/10 mb-10">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-6 py-6">
                <div>
                  <p className="font-heading text-lg text-offwhite">{item.name}</p>
                  <p className="text-sm text-offwhite/45">
                    {new Date(item.startTime).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-arc font-heading text-lg">&#8377;{item.fee}</span>
                  <button
                    className="text-danger text-xs uppercase tracking-wider hover:underline"
                    onClick={() => removeItem(item.id)}
                    data-log={`cart-remove-${item.id}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-10">
            <span className="font-heading text-sm uppercase tracking-wider text-offwhite/60">Total</span>
            <span className="font-serif text-3xl text-offwhite">&#8377;{total}</span>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => openPanel("registration")}
            data-log="cart-proceed-to-registration"
          >
            Proceed to Registration
          </Button>
        </>
      )}
    </div>
  );
}

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, removeItem, total } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-white/60 mb-4">Your cart is empty.</p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <Card key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-white/50">
                    {new Date(item.startTime).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-cyan font-semibold">₹{item.fee}</span>
                  <button
                    className="text-danger text-sm hover:underline"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="flex items-center justify-between mb-6">
            <span className="font-heading text-lg font-semibold">Total</span>
            <span className="font-heading text-2xl font-bold text-cyan">₹{total}</span>
          </Card>

          <Button size="lg" className="w-full" onClick={() => navigate("/register")}>
            Proceed to Registration
          </Button>
        </>
      )}
    </div>
  );
}

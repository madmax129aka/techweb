import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "techastra_cart";

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /** Returns the clashing event name if adding `event` would overlap an existing cart item, else null. */
  const findClash = useCallback(
    (event) => {
      const clash = items.find((i) => rangesOverlap(i.startTime, i.endTime, event.startTime, event.endTime));
      return clash ? clash.name : null;
    },
    [items]
  );

  const addItem = (event) => {
    if (items.some((i) => i.id === event.id)) return { ok: false, reason: "Already in cart" };
    const clash = findClash(event);
    if (clash) return { ok: false, reason: `Clashes with "${clash}" already in your cart` };
    setItems((prev) => [...prev, event]);
    return { ok: true };
  };

  const removeItem = (eventId) => {
    setItems((prev) => prev.filter((i) => i.id !== eventId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.fee, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, findClash }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

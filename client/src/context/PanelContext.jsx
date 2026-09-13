import React, { createContext, useContext, useState, useCallback } from "react";

const PanelContext = createContext(null);

/**
 * Tracks which slide-in overlay panel (if any) is currently open, so it
 * can be triggered from anywhere in the app (nav links, buttons) as an
 * overlay ON TOP of whatever page the user is already on, without a
 * route change.
 *
 * Registration itself moved OFF this pattern and onto routed pages
 * (/register, /checkout - see pages/Register.jsx for why), so Help Desk
 * is currently the only panel using this context. Kept as its own
 * context rather than folded into something else since Help Desk is
 * meant to be reachable as a quick overlay from any page, including ones
 * with their own local state, and a future panel (e.g. a quick feedback
 * form) may need the same "open from anywhere" behavior.
 *
 * HelpDeskPanel is mounted once at the App root, alongside FullScreenMenu,
 * and reads its open/closed state from this context.
 */
export function PanelProvider({ children }) {
  const [activePanel, setActivePanel] = useState(null);
  const [panelPayload, setPanelPayload] = useState(null);

  const openPanel = useCallback((name, payload = null) => {
    setPanelPayload(payload);
    setActivePanel(name);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
    setPanelPayload(null);
  }, []);

  return (
    <PanelContext.Provider value={{ activePanel, panelPayload, openPanel, closePanel }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanels() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error("usePanels must be used within a PanelProvider");
  return ctx;
}

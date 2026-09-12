import React, { createContext, useContext, useState, useCallback } from "react";

const PanelContext = createContext(null);

/**
 * Tracks which slide-in form panel (if any) is currently open, so
 * Registration/Help Desk/Feedback can be triggered from anywhere in the
 * app (nav links, cards, buttons) as an overlay ON TOP of whatever page
 * the user is already on - never a route change, never navigating away -
 * per the "forms as slide-in overlays, not separate pages" brief.
 *
 * The panels themselves (RegistrationPanel, HelpDeskPanel, and any future
 * ones) are mounted once at the App root, alongside FullScreenMenu, and
 * read their open/closed state from this context.
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

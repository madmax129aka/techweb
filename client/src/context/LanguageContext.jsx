import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext(null);

// Minimal Tamil/English string table. Extend as more pages need translation.
const STRINGS = {
  en: {
    home: "Home",
    events: "Events",
    cart: "Cart",
    leaderboard: "Leaderboard",
    login: "Login",
    dashboard: "Dashboard",
    registerNow: "Register Now",
    verifyCertificate: "Verify Certificate",
    heroTagline: "Where Ideas Launch.",
  },
  ta: {
    home: "முகப்பு",
    events: "நிகழ்வுகள்",
    cart: "கூடை",
    leaderboard: "தரவரிசை",
    login: "உள்நுழைய",
    dashboard: "டாஷ்போர்டு",
    registerNow: "இப்போது பதிவு செய்யவும்",
    verifyCertificate: "சான்றிதழை சரிபார்க்கவும்",
    heroTagline: "யோசனைகள் தொடங்கும் இடம்.",
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("techastra_lang") || "en");

  const toggleLang = () => {
    const next = lang === "en" ? "ta" : "en";
    setLang(next);
    localStorage.setItem("techastra_lang", next);
  };

  const t = (key) => STRINGS[lang]?.[key] || STRINGS.en[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import VisionCursor from "./components/VisionCursor.jsx";
import { initClickLogger } from "./lib/clickLogger.js";
import "./index.css";

// Starts the global click/error logger described in
// client/src/lib/clickLogger.js - every click on the app (and any
// uncaught JS error) gets POSTed to the backend and printed in the
// terminal running `npm run dev`, since browser console.log() never
// reaches that terminal on its own.
initClickLogger();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <VisionCursor />
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#0D0303",
                  color: "#F5F3F0",
                  border: "1px solid rgba(170,5,5,0.3)",
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#161B2E",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

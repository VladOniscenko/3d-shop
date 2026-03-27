import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import { I18nProvider } from "./i18n/I18nContext.tsx";
import { NotifyProvider } from "./context/NotifyContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <NotifyProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </NotifyProvider>
    </I18nProvider>
  </StrictMode>,
);

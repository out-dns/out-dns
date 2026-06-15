import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { LogProvider } from "./contexts/logContext";
import { PopupProvider } from "./contexts/popupContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PopupProvider>
      <LogProvider>
        <App />
      </LogProvider>
    </PopupProvider>
  </React.StrictMode>,
);

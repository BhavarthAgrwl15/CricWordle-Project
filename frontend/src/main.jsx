// src/index.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/auth-provider";
import { GameProvider } from "./contexts/game-provider";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
         <GameProvider>
      <App />
    </GameProvider>
    </AuthProvider>
  </StrictMode>
);

import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/tokens.css";
import "./styles/design-system.css";
import "./styles/global.css";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ThemeProvider>
);

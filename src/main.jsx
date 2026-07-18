import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/global.css";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

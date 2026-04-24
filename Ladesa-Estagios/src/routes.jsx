import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Painel from "./pages/Painel";
import ProtectedRoute from "./components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/painel"
        element={
          <ProtectedRoute>
            <Painel />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import Layout from "./components/layout/Layout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

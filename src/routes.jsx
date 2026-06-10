import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import LayoutAluno from "./components/layout/LayoutAluno";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/aluno/*"
        element={
          <ProtectedRoute>
            <LayoutAluno />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

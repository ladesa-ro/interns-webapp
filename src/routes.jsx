import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LayoutAluno from "./components/layout/LayoutAluno";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Rota para o fluxo de ALUNOS — só alunos acessam */}
      <Route
        path="/aluno/*"
        element={
          <ProtectedRoute perfilNecessario="aluno">
            <LayoutAluno />
          </ProtectedRoute>
        }
      />

      {/* Rota para o fluxo ADMINISTRATIVO (CIEC) — só admins acessam */}
      <Route
        path="/*"
        element={
          <ProtectedRoute perfilNecessario="admin">
            <Layout />
          </ProtectedRoute>
        }
      />

      {/* Fallback geral */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
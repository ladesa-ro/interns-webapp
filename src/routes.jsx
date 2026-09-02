import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import ConfirmarFolhaPonto from "./pages/folha-ponto/ConfirmarFolhaPonto";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LayoutAluno from "./components/layout/LayoutAluno";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública de login */}
      <Route path="/login" element={<Login />} />

      {/* Confirmação do supervisor por token: fluxo público, sem sessão */}
      <Route
        path="/folha-ponto/confirmar/:tokenId"
        element={<ConfirmarFolhaPonto />}
      />
      <Route path="/folha-ponto/confirmar" element={<ConfirmarFolhaPonto />} />

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
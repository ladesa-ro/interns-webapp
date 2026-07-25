import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children, perfilNecessario }) {
  const { perfil, carregando } = useAuth();
  const token = localStorage.getItem("token");

  // Enquanto o contexto está lendo o token do localStorage, não faz nada
  if (carregando) {
    return null;
  }

  // Sem token → redireciona para login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se foi especificado um perfil necessário e o usuário não tem esse perfil,
  // redireciona para a área correta em vez de mostrar tela branca
  if (perfilNecessario && perfil && perfil !== perfilNecessario) {
    if (perfil === "aluno") {
      return <Navigate to="/aluno" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { PERFIL_ALUNO } from "../../contexts/perfis";

export default function ProtectedRoute({ children, perfilNecessario }) {
  const { autenticado, perfil, erroPerfil, carregando } = useAuth();

  if (carregando) {
    return null;
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  // Perfil não reconhecido nunca recebe acesso: mostra erro em vez de redirecionar,
  // o que criaria ciclo entre a área de aluno e a administrativa.
  if (!perfil) {
    return (
      <div role="alert" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Acesso indisponível</h1>
        <p>{erroPerfil}</p>
      </div>
    );
  }

  if (perfilNecessario && perfil !== perfilNecessario) {
    return <Navigate to={perfil === PERFIL_ALUNO ? "/aluno" : "/"} replace />;
  }

  return children;
}

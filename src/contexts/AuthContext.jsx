import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

/**
 * Decodifica o payload do JWT (sem verificar assinatura — apenas client-side).
 */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Analisa o payload decodificado e determina o perfil do usuário.
 * Retorna "aluno" | "admin".
 * O payload completo é impresso no console para diagnóstico.
 */
function determinarPerfil(payload) {
  if (!payload) return "admin";

  // Log de diagnóstico — remover após confirmar o campo correto no JWT da API
  console.log("[AUTH] JWT payload decodificado:", payload);

  const textoCompleto = JSON.stringify(payload).toLowerCase();

  if (
    textoCompleto.includes("aluno") ||
    textoCompleto.includes("student") ||
    textoCompleto.includes("estudante") ||
    textoCompleto.includes("discente")
  ) {
    return "aluno";
  }

  if (
    textoCompleto.includes("servidor") ||
    textoCompleto.includes("coordenador") ||
    textoCompleto.includes("admin") ||
    textoCompleto.includes("employee") ||
    textoCompleto.includes("staff")
  ) {
    return "admin";
  }

  // Fallback por matrícula: padrão IFRO alunos = 13 dígitos
  const matriculaCandidata = String(
    payload.sub || payload.username || payload.matricula || payload.login || ""
  );

  if (/^\d{13}$/.test(matriculaCandidata)) {
    console.log("[AUTH] Detectado como aluno pela matrícula de 13 dígitos:", matriculaCandidata);
    return "aluno";
  }

  // Padrão IFRO servidores = matrícula SIAPE 7 dígitos
  if (/^\d{7}$/.test(matriculaCandidata)) {
    console.log("[AUTH] Detectado como servidor pela matrícula SIAPE:", matriculaCandidata);
    return "admin";
  }

  console.warn("[AUTH] Perfil não determinado. Usando 'admin' como fallback.");
  return "admin";
}

export function AuthProvider({ children }) {
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function inicializar() {
      const token = localStorage.getItem("token");
      const novoPerfil = token ? determinarPerfil(decodeJwtPayload(token)) : null;
      setPerfil(novoPerfil);
      setCarregando(false);
    }
    inicializar();
  }, []);

  function login(token) {
    localStorage.setItem("token", token);
    const payload = decodeJwtPayload(token);
    const novoPerfil = determinarPerfil(payload);
    setPerfil(novoPerfil);
    return novoPerfil;
  }

  function logout() {
    localStorage.removeItem("token");
    setPerfil(null);
  }

  return (
    <AuthContext.Provider value={{ perfil, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}

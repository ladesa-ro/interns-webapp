import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  apiJson,
  authMode,
  setAccessToken,
  setUnauthorizedHandler,
} from "../utils/api";
import {
  PERFIL_ADMIN,
  PERFIL_ALUNO,
  determinarPerfil,
} from "./perfis";

const AuthContext = createContext(null);

const ENDPOINT_SESSAO = "/autenticacao/quem-sou-eu";
const ENDPOINT_LOGIN = "/autenticacao/login";

const ESTADO_ANONIMO = {
  autenticado: false,
  usuario: null,
  perfil: null,
  usuarioId: null,
  erroPerfil: null,
};

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(ESTADO_ANONIMO);
  const [carregando, setCarregando] = useState(true);

  // A API responde 200 com usuario: null quando não há sessão, então o estado
  // anônimo é determinado pelo corpo, não pelo status.
  const carregarSessao = useCallback(async () => {
    const dados = await apiJson(ENDPOINT_SESSAO);
    const usuario = dados?.usuario ?? null;

    if (!usuario) {
      setSessao(ESTADO_ANONIMO);
      return ESTADO_ANONIMO;
    }

    const { perfil, erro } = determinarPerfil(usuario, dados?.perfisAtivos);

    const nova = {
      autenticado: true,
      usuario,
      perfil,
      usuarioId: usuario.id ?? null,
      erroPerfil: erro,
    };

    setSessao(nova);
    return nova;
  }, []);

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
      try {
        await carregarSessao();
      } catch {
        if (ativo) setSessao(ESTADO_ANONIMO);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    inicializar();

    return () => {
      ativo = false;
    };
  }, [carregarSessao]);

  const encerrarSessaoLocal = useCallback(() => {
    setAccessToken(null);
    setSessao(ESTADO_ANONIMO);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(encerrarSessaoLocal);
    return () => setUnauthorizedHandler(null);
  }, [encerrarSessaoLocal]);

  const login = useCallback(
    async (matricula, senha) => {
      const credenciais = await apiJson(ENDPOINT_LOGIN, {
        method: "POST",
        body: JSON.stringify({ matricula, senha }),
      });

      // No modo cookie o backend emite Set-Cookie e nenhum token trafega no corpo.
      if (authMode === "bearer" && credenciais?.access_token) {
        setAccessToken(credenciais.access_token);
      }

      return carregarSessao();
    },
    [carregarSessao]
  );

  // A API não expõe endpoint de logout; o encerramento é local. Quando o
  // backend publicar POST /autenticacao/logout, chamá-lo aqui antes de limpar.
  const logout = useCallback(async () => {
    encerrarSessaoLocal();
  }, [encerrarSessaoLocal]);

  return (
    <AuthContext.Provider
      value={{
        ...sessao,
        carregando,
        login,
        logout,
        recarregarSessao: carregarSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return ctx;
}

export { PERFIL_ADMIN, PERFIL_ALUNO };

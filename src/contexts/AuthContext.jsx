import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

/**
 * =========================================================
 * DECODIFICAR PAYLOAD DO JWT
 * =========================================================
 *
 * Apenas decodifica o JWT no frontend.
 * Isso NÃO verifica a assinatura do token.
 */
function decodeJwtPayload(token) {
  try {
    if (!token) {
      return null;
    }

    const payload = jwtDecode(token);

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}


/**
 * =========================================================
 * PEGAR ID DO USUÁRIO
 * =========================================================
 *
 * Como ainda não sabemos exatamente em qual campo
 * a API coloca o ID dentro do JWT, verificamos
 * algumas possibilidades.
 */
function pegarUsuarioId(payload) {

  if (!payload) {
    return null;
  }


  /*
   * Possibilidades mais comuns
   */

  const id =
    payload.id ||
    payload.userId ||
    payload.user_id ||
    payload.usuarioId ||
    payload.usuario_id ||
    payload.user?.id ||
    payload.usuario?.id ||
    null;


  /*
   * IMPORTANTE:
   *
   * Não usamos "sub" automaticamente como usuarioId,
   * porque no seu sistema ele pode representar
   * matrícula em vez do UUID do usuário.
   */


  console.log(
    "[AUTH] ID encontrado no JWT:",
    id
  );


  return id;
}


/**
 * =========================================================
 * DETERMINAR PERFIL
 * =========================================================
 *
 * Retorna:
 *
 * "aluno"
 * "admin"
 */
function determinarPerfil(payload) {

  if (!payload) {
    return "admin";
  }


  console.log(
    "[AUTH] JWT payload decodificado:",
    payload
  );


  const textoCompleto =
    JSON.stringify(payload).toLowerCase();


  /*
   * ALUNO
   */

  if (
    textoCompleto.includes("aluno") ||
    textoCompleto.includes("student") ||
    textoCompleto.includes("estudante") ||
    textoCompleto.includes("discente")
  ) {

    return "aluno";
  }


  /*
   * ADMIN / SERVIDOR
   */

  if (
    textoCompleto.includes("servidor") ||
    textoCompleto.includes("coordenador") ||
    textoCompleto.includes("admin") ||
    textoCompleto.includes("employee") ||
    textoCompleto.includes("staff")
  ) {

    return "admin";
  }


  /*
   * MATRÍCULA
   */

  const matriculaCandidata = String(
    payload.sub ||
    payload.username ||
    payload.matricula ||
    payload.login ||
    ""
  );


  /*
   * IFRO - aluno
   */

  if (
    /^\d{13}$/.test(
      matriculaCandidata
    )
  ) {

    console.log(
      "[AUTH] Detectado como aluno pela matrícula:",
      matriculaCandidata
    );

    return "aluno";
  }


  /*
   * IFRO - servidor
   */

  if (
    /^\d{7}$/.test(
      matriculaCandidata
    )
  ) {

    console.log(
      "[AUTH] Detectado como servidor pela matrícula:",
      matriculaCandidata
    );

    return "admin";
  }


  /*
   * Fallback
   */

  console.warn(
    "[AUTH] Perfil não determinado. Usando 'admin'."
  );

  return "admin";
}


/**
 * =========================================================
 * AUTH PROVIDER
 * =========================================================
 */

export function AuthProvider({ children }) {

  const [perfil, setPerfil] =
    useState(null);


  const [usuarioId, setUsuarioId] =
    useState(null);


  const [usuario, setUsuario] =
    useState(null);


  const [token, setToken] =
    useState(null);


  const [carregando, setCarregando] =
    useState(true);


  /**
   * =======================================================
   * INICIALIZAR AUTENTICAÇÃO
   * =======================================================
   */

  useEffect(() => {

    function inicializar() {

      try {

        const tokenSalvo = null;


        /*
         * Usuário não está logado
         */

        if (!tokenSalvo) {

          setToken(null);
          setPerfil(null);
          setUsuarioId(null);
          setUsuario(null);
          setCarregando(false);

          return;
        }


        /*
         * Decodifica token
         */

        const payload =
          decodeJwtPayload(tokenSalvo);


        console.log(
          "[AUTH] Payload inicial:",
          payload
        );


        /*
         * Descobre perfil
         */

        const novoPerfil =
          determinarPerfil(payload);


        /*
         * Descobre ID
         */

        const novoUsuarioId =
          pegarUsuarioId(payload);


        /*
         * Salva tudo no estado
         */

        setToken(tokenSalvo);

        setPerfil(novoPerfil);

        setUsuarioId(novoUsuarioId);

        setUsuario(payload);


      } catch (error) {

        console.error(
          "[AUTH] Erro ao inicializar:",
          error
        );

        setToken(null);
        setPerfil(null);
        setUsuarioId(null);
        setUsuario(null);

      } finally {

        setCarregando(false);

      }

    }


    inicializar();

  }, []);


  /**
   * =======================================================
   * LOGIN
   * =======================================================
   */

  function login(novoToken) {

    /*
     * Salva token
     */

    /*
     * Decodifica JWT
     */

    const payload =
      decodeJwtPayload(novoToken);


    console.log(
      "[AUTH] Payload após login:",
      payload
    );


    /*
     * Descobre perfil
     */

    const novoPerfil =
      determinarPerfil(payload);


    /*
     * Descobre ID
     */

    const novoUsuarioId =
      pegarUsuarioId(payload);


    console.log(
      "[AUTH] Usuário logado:",
      {
        id: novoUsuarioId,
        perfil: novoPerfil,
      }
    );


    /*
     * Atualiza estados
     */

    setToken(novoToken);

    setPerfil(novoPerfil);

    setUsuarioId(novoUsuarioId);

    setUsuario(payload);


    return novoPerfil;
  }


  /**
   * =======================================================
   * LOGOUT
   * =======================================================
   */

  function logout() {

    setToken(null);

    setPerfil(null);

    setUsuarioId(null);

    setUsuario(null);
  }


  /**
   * =======================================================
   * CONTEXT
   * =======================================================
   */

  return (

    <AuthContext.Provider
      value={{
        perfil,
        carregando,

        token,

        usuarioId,

        usuario,

        login,

        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  );
}


/**
 * =========================================================
 * USE AUTH
 * =========================================================
 */

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {

  const ctx =
    useContext(AuthContext);


  if (!ctx) {

    throw new Error(
      "useAuth deve ser usado dentro de AuthProvider."
    );

  }


  return ctx;
}
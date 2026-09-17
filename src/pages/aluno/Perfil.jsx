import { useEffect, useRef, useState } from "react";

import styles from "./Perfil.module.css";

import {
  Mail,
  Users,
  User,
  Phone,
  Camera,
  Pencil,
  X,
  Plus,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import apiFetch, { mensagemDeErro } from "../../utils/api";
import { atualizarImagemPerfil, buscarImagemPerfilUrl } from "../../utils/imagemPerfilApi";

export default function Perfil() {

  // =====================================================
  // USUÁRIO AUTENTICADO
  // =====================================================

  const {
    autenticado,
    usuarioId,
    carregando: carregandoAuth,
  } = useAuth();


  // =====================================================
  // ESTADOS
  // =====================================================

  const [perfil, setPerfil] =
    useState(null);

  const [emails, setEmails] =
    useState([]);

  const [novoEmail, setNovoEmail] =
    useState("");

  const [modalEmail, setModalEmail] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [fotoUrl, setFotoUrl] = useState(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState("");
  const inputFotoRef = useRef(null);
  // Ref que rastreia a blob URL ativa para garantir que ela seja revogada ao
  // desmontar o componente, mesmo que tenha sido atualizada pelo upload.
  const fotoUrlRef = useRef(null);

  function revogarFotoAtual() {
    if (fotoUrlRef.current) {
      URL.revokeObjectURL(fotoUrlRef.current);
      fotoUrlRef.current = null;
    }
    // Limpa o estado para evitar que a <img> fique com src de URL revogada
    // (mostraria o alt text como imagem quebrada ao invés do placeholder).
    setFotoUrl(null);
  }

  function atualizarFotoUrl(novaUrl) {
    // Revoga a URL anterior antes de definir a nova.
    if (fotoUrlRef.current) URL.revokeObjectURL(fotoUrlRef.current);
    fotoUrlRef.current = novaUrl;
    setFotoUrl(novaUrl);
  }


  // =====================================================
  // BUSCAR FOTO DE PERFIL DO USUÁRIO LOGADO
  // =====================================================

  useEffect(() => {
    if (!usuarioId) return undefined;

    const controlador = new AbortController();

    async function carregarFoto() {
      try {
        const url = await buscarImagemPerfilUrl(usuarioId, { signal: controlador.signal });
        if (controlador.signal.aborted) return;
        atualizarFotoUrl(url);
      } catch (error) {
        if (!controlador.signal.aborted) setErroFoto(mensagemDeErro(error));
      }
    }

    carregarFoto();

    return () => {
      controlador.abort();
      // Revoga e limpa o estado — garante que nenhuma blob URL revogada
      // apareça como imagem quebrada enquanto o próximo fetch carrega.
      revogarFotoAtual();
    };
  }, [usuarioId]);

  async function selecionarNovaFoto(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo || !usuarioId || enviandoFoto) return;

    setEnviandoFoto(true);
    setErroFoto("");

    try {
      await atualizarImagemPerfil(usuarioId, arquivo);
      // Usa o próprio arquivo selecionado para criar o blob URL — garante que o
      // tipo é sempre uma imagem válida (o que o usuário acabou de selecionar).
      // Evita um GET extra que pode retornar JSON ou redirect no lugar do binário.
      const novaUrl = URL.createObjectURL(arquivo);
      atualizarFotoUrl(novaUrl);
    } catch (error) {
      setErroFoto(mensagemDeErro(error));
    } finally {
      setEnviandoFoto(false);
    }
  }


  // =====================================================
  // BUSCAR PERFIL DO USUÁRIO LOGADO
  // =====================================================

  useEffect(() => {

    async function buscarPerfil() {

      try {

        setCarregando(true);
        setErro("");


        // -----------------------------------------------
        // Verifica autenticação
        // -----------------------------------------------

        if (!autenticado) {

          setErro(
            "Usuário não está autenticado."
          );

          return;
        }


        // -----------------------------------------------
        // Verifica ID
        // -----------------------------------------------

        if (!usuarioId) {

          console.error(
            "[PERFIL] usuarioId não encontrado:",
            usuarioId
          );

          setErro(
            "Não foi possível identificar o usuário logado."
          );

          return;
        }


        console.log(
          "[PERFIL] Buscando usuário:",
          usuarioId
        );


        // -----------------------------------------------
        // URL DA API
        // -----------------------------------------------

        console.log(
          "[PERFIL] Buscando perfil do usuário:",
          usuarioId
        );


        // -----------------------------------------------
        // REQUEST
        // -----------------------------------------------

        const resposta =
          await apiFetch(
            `/perfis?filter.usuario.id=${encodeURIComponent(usuarioId)}`
          );


        console.log(
          "[PERFIL] Status:",
          resposta.status
        );


        if (!resposta.ok) {

          throw new Error(
            `Erro ao buscar perfil. Status: ${resposta.status}`
          );

        }


        // -----------------------------------------------
        // JSON
        // -----------------------------------------------

        const dados =
          await resposta.json();


        console.log(
          "[PERFIL] Dados recebidos:",
          dados
        );


        // -----------------------------------------------
        // Verificar se encontrou
        // -----------------------------------------------

        if (
          !dados.data ||
          dados.data.length === 0
        ) {

          setErro(
            "Nenhum perfil foi encontrado para o usuário logado."
          );

          return;
        }


        // -----------------------------------------------
        // Perfil encontrado
        // -----------------------------------------------

        const perfilEncontrado =
          dados.data[0];


        console.log(
          "[PERFIL] Perfil encontrado:",
          perfilEncontrado
        );


        setPerfil(
          perfilEncontrado
        );


        // -----------------------------------------------
        // EMAIL PRINCIPAL
        // -----------------------------------------------

        const emailPrincipal =
          perfilEncontrado.usuario?.email;


        if (emailPrincipal) {

          setEmails([
            emailPrincipal
          ]);

        } else {

          setEmails([]);

        }


      } catch (error) {

        console.error(
          "[PERFIL] Erro:",
          error
        );

        setErro(
          error.message ||
          "Erro ao carregar perfil."
        );

      } finally {

        setCarregando(false);

      }

    }


    /*
     * Só busca quando o AuthContext terminou
     * de carregar e a sessão é conhecida.
     */

    if (!carregandoAuth) {

      buscarPerfil();

    }

  }, [
    autenticado,
    usuarioId,
    carregandoAuth,
  ]);


  // =====================================================
  // LOADING DO AUTH
  // =====================================================

  if (carregandoAuth) {

    return (
      <div className={styles.loading}>
        Carregando usuário...
      </div>
    );

  }


  // =====================================================
  // LOADING DO PERFIL
  // =====================================================

  if (carregando) {

    return (
      <div className={styles.loading}>
        Carregando perfil...
      </div>
    );

  }


  // =====================================================
  // ERRO
  // =====================================================

  if (erro) {

    return (
      <div className={styles.erro}>
        <h2>
          Não foi possível carregar o perfil
        </h2>

        <p>
          {erro}
        </p>
      </div>
    );

  }


  // =====================================================
  // SEM PERFIL
  // =====================================================

  if (!perfil) {

    return (
      <div className={styles.erro}>
        <h2>
          Perfil não encontrado
        </h2>

        <p>
          Não encontramos os dados do usuário logado.
        </p>
      </div>
    );

  }


  // =====================================================
  // DADOS DO USUÁRIO
  // =====================================================

  const usuario =
    perfil.usuario || {};


  const nome =
    usuario.nome ||
    "Nome não informado";


  const matricula =
    usuario.matricula ||
    "Matrícula não informada";


  const cargo =
    perfil.cargo ||
    "Não informado";


  // =====================================================
  // CAMPUS
  // =====================================================

  const campus =
    perfil.campus || {};


  const nomeCampus =
    campus.apelido ||
    campus.nomeFantasia ||
    campus.razaoSocial ||
    "Campus não informado";


  // =====================================================
  // ENDEREÇO
  // =====================================================

  const endereco =
    campus.endereco || {};


  const cidade =
    endereco.cidade || {};


  const nomeCidade =
    cidade.nome ||
    "Cidade não informada";


  // =====================================================
  // ADICIONAR EMAIL
  // =====================================================

  function adicionarEmail() {

    const email =
      novoEmail.trim();


    if (!email) {

      return;

    }


    // Verifica duplicado

    if (
      emails.includes(email)
    ) {

      alert(
        "Esse email já foi adicionado."
      );

      return;

    }


    setEmails([
      ...emails,
      email,
    ]);


    setNovoEmail("");

  }


  // =====================================================
  // REMOVER EMAIL
  // =====================================================

  function removerEmail(index) {

    // Não permite remover o principal

    if (index === 0) {

      return;

    }


    setEmails(
      emails.filter(
        (_, i) => i !== index
      )
    );

  }


  // =====================================================
  // SALVAR EMAILS
  // =====================================================

  function salvarEmails() {

    /*
     * Por enquanto salva no estado do React.
     *
     * Isso faz os novos emails aparecerem no card.
     *
     * Para salvar no banco da API precisamos descobrir
     * qual endpoint de atualização de usuário/email a API
     * disponibiliza.
     */

    console.log(
      "[PERFIL] Emails:",
      emails
    );


    setModalEmail(false);

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className={styles.perfilPage}>

      <div className={styles.perfilCard}>

        {/* =================================================
            LADO ESQUERDO
        ================================================= */}

        <div
          className={
            styles.perfilEsquerda
          }
        >

          <div
            className={
              styles.fotoContainer
            }
          >

            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                className={
                  styles.fotoPerfil
                }
              />
            ) : (
              <div
                className={styles.fotoPlaceholder}
                role="img"
                aria-label="Sem foto de perfil"
              >
                <User size={90} aria-hidden="true" />
              </div>
            )}

            <input
              ref={inputFotoRef}
              type="file"
              accept="image/*"
              className={styles.inputFotoOculto}
              onChange={selecionarNovaFoto}
              aria-hidden="true"
              tabIndex={-1}
              data-testid="input-foto-perfil"
            />

            <button
              type="button"
              className={
                styles.cameraBtn
              }
              onClick={() => inputFotoRef.current?.click()}
              disabled={enviandoFoto || !usuarioId}
              aria-label="Alterar foto de perfil"
            >

              <Camera size={18} />

            </button>

          </div>

          {erroFoto ? (
            <p className={styles.erroFoto} role="alert">{erroFoto}</p>
          ) : null}


          <h2>
            {nome}
          </h2>

        </div>


        {/* LINHA */}

        <div
          className={
            styles.linha
          }
        />


        {/* =================================================
            LADO DIREITO
        ================================================= */}

        <div
          className={
            styles.perfilDireita
          }
        >

          {/* =================================================
              EMAIL
          ================================================= */}

          <div
            className={
              styles.infoCard
            }
          >

            <button
              className={
                styles.editar
              }

              onClick={() =>
                setModalEmail(true)
              }
            >

              <Pencil size={12} />

              <span>
                Editar
              </span>

            </button>


            <Mail size={20} />


            <div
              className={
                styles.emailCardContent
              }
            >

              <h3>
                Email
              </h3>


              <div
                className={
                  styles.listaEmailsCard
                }
              >

                {emails.map(
                  (email, index) => (

                    <p
                      key={index}
                    >
                      {email}
                    </p>

                  )
                )}

              </div>

            </div>

          </div>


          {/* =================================================
              TURMA / CAMPUS
          ================================================= */}

          <div
            className={
              styles.infoCard
            }
          >

            <Users size={20} />

            <div>

              <h3>
                Campus
              </h3>

              <p>
                {nomeCampus}
              </p>

            </div>

          </div>


          {/* =================================================
              NOME
          ================================================= */}

          <div
            className={
              styles.infoCard
            }
          >

            <User size={20} />

            <div>

              <h3>
                Nome
              </h3>

              <p>
                {nome}
              </p>

            </div>

          </div>


          {/* =================================================
              MATRÍCULA
          ================================================= */}

          <div
            className={
              styles.infoCard
            }
          >

            <Phone size={20} />

            <div>

              <h3>
                Matrícula
              </h3>

              <p>
                {matricula}
              </p>

            </div>

          </div>


          {/* =================================================
              CARGO
          ================================================= */}

          <div
            className={
              styles.infoCard
            }
          >

            <User size={20} />

            <div>

              <h3>
                Cargo
              </h3>

              <p>
                {cargo}
              </p>

            </div>

          </div>


          {/* =================================================
              CIDADE
          ================================================= */}

          <div
            className={
              styles.infoCard
            }
          >

            <Users size={20} />

            <div>

              <h3>
                Cidade
              </h3>

              <p>
                {nomeCidade}
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          MODAL DE EMAIL
      ===================================================== */}

      {modalEmail && (

        <div
          className={
            styles.modalOverlay
          }

          onClick={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {

              setModalEmail(false);

            }

          }}
        >

          <div
            className={
              styles.modal
            }
          >

            {/* HEADER */}

            <div
              className={
                styles.modalHeader
              }
            >

              <div
                className={
                  styles.modalTitle
                }
              >

                <Mail size={22} />

                <h2>
                  Editar emails
                </h2>

              </div>


              <button
                className={
                  styles.fecharModal
                }

                onClick={() =>
                  setModalEmail(false)
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* CONTEÚDO */}

            <div
              className={
                styles.modalContent
              }
            >

              <p
                className={
                  styles.modalDescricao
                }
              >
                Gerencie os emails vinculados ao seu perfil.
              </p>


              {/* EMAILS */}

              <div
                className={
                  styles.emailLista
                }
              >

                {emails.map(
                  (email, index) => (

                    <div
                      className={
                        styles.emailItem
                      }

                      key={index}
                    >

                      <div
                        className={
                          styles.emailItemInfo
                        }
                      >

                        <span>
                          {index === 0
                            ? "Principal"
                            : "Email adicional"}
                        </span>


                        <p>
                          {email}
                        </p>

                      </div>


                      {index !== 0 && (

                        <button
                          className={
                            styles.removerEmail
                          }

                          onClick={() =>
                            removerEmail(index)
                          }
                        >

                          <X size={17} />

                        </button>

                      )}

                    </div>

                  )
                )}

              </div>


              {/* =================================================
                  NOVO EMAIL
              ================================================= */}

              <div
                className={
                  styles.novoEmail
                }
              >

                <label>
                  Adicionar email
                </label>


                <div
                  className={
                    styles.inputEmail
                  }
                >

                  <Mail size={18} />


                  <input
                    type="email"
                    placeholder="Digite um novo email"
                    value={novoEmail}

                    onChange={(e) =>
                      setNovoEmail(
                        e.target.value
                      )
                    }

                    onKeyDown={(e) => {

                      if (
                        e.key === "Enter"
                      ) {

                        adicionarEmail();

                      }

                    }}
                  />

                </div>


                <button
                  className={
                    styles.btnAdicionar
                  }

                  onClick={
                    adicionarEmail
                  }
                >

                  <Plus size={18} />

                  Adicionar email

                </button>

              </div>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
              className={
                styles.modalFooter
              }
            >

              <button
                className={
                  styles.btnCancelar
                }

                onClick={() =>
                  setModalEmail(false)
                }
              >
                Cancelar
              </button>


              <button
                className={
                  styles.btnSalvar
                }

                onClick={
                  salvarEmails
                }
              >
                Salvar alterações
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}
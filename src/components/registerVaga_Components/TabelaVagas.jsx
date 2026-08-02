import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Styles from "./tabelaVagas.module.css";
import PesquisaIcon from "../icons_Components/Icon_Pesquisa_Comp";
import EditarIcon from "../icons_Components/Icon_Editar_Comp";
import DeletarIcon from "../icons_Components/Icon_Deletar_Comp";
import apiFetch from "../../utils/api";

export default function TabelaVagas() {
  const navigate = useNavigate();

  // Estados dos dados e carregamento
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const itensPorPagina = 10;

  // Estados do modal de exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [deletando, setDeletando] = useState(false);

  // Busca as vagas paginadas do backend
  useEffect(() => {
    let cancelado = false;

    async function carregarVagas() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: pagina.toString(),
          limit: itensPorPagina.toString(),
        });

        if (busca.trim()) {
          queryParams.append("search", busca.trim());
        }

        // Busca estágios paginados e tabelas auxiliares para enriquecer exibição
        const [resEstagios, resEmpresas, resCursos, resCampi] = await Promise.all([
          apiFetch(`/estagios?${queryParams.toString()}`),
          apiFetch("/empresas?limit=1000").catch(() => null),
          apiFetch("/cursos?limit=1000").catch(() => null),
          apiFetch("/campi?limit=1000").catch(() => null),
        ]);

        if (!resEstagios.ok) {
          throw new Error("Erro ao carregar lista de vagas.");
        }

        const dataEstagios = await resEstagios.json();
        const dataEmpresas = resEmpresas && resEmpresas.ok ? await resEmpresas.json() : { data: [] };
        const dataCursos = resCursos && resCursos.ok ? await resCursos.json() : { data: [] };
        const dataCampi = resCampi && resCampi.ok ? await resCampi.json() : { data: [] };

        if (cancelado) return;

        // Cria mapas para buscas O(1)
        const empresasMap = new Map((dataEmpresas.data || []).map((emp) => [emp.id, emp]));
        const cursosMap = new Map((dataCursos.data || []).map((c) => [c.id, c]));
        const campiMap = new Map((dataCampi.data || []).map((cam) => [cam.id, cam]));

        const rawEstagios = dataEstagios.data || (Array.isArray(dataEstagios) ? dataEstagios : []);

        // Formata e unifica as vagas
        const listaVagas = rawEstagios.map((item) => {
          const empresaObj = item.empresa?.id ? empresasMap.get(item.empresa.id) : null;
          const cursoObj = item.CursoReferencia?.id ? cursosMap.get(item.CursoReferencia.id) : null;
          const campusObj = item.campus?.id ? campiMap.get(item.campus.id) : null;

          const empresaNome =
            item.empresa?.nomeFantasia ||
            item.empresa?.razaoSocial ||
            empresaObj?.nomeFantasia ||
            empresaObj?.razaoSocial ||
            "Não informada";

          const cursoNome =
            item.CursoReferencia?.nomeAbreviado ||
            item.CursoReferencia?.nome ||
            cursoObj?.nomeAbreviado ||
            cursoObj?.nome ||
            "Não informado";

          const campusNome =
            item.campus?.nomeFantasia ||
            item.campus?.razaoSocial ||
            campusObj?.nomeFantasia ||
            campusObj?.razaoSocial ||
            "Não informado";

          return {
            id: item.id,
            campusNome,
            empresaNome,
            cursoNome,
            cargaHoraria: item.cargaHoraria || 1,
            nomeSupervisor: item.nomeSupervisor || "-",
            status: item.status || "DISPONIVEL",
          };
        });

        setVagas(listaVagas);

        // Atualiza total de páginas dinamicamente com base nos metadados da API Ladesa
        const pageCount = dataEstagios.meta?.pageCount || dataEstagios.meta?.totalPages || dataEstagios.pageCount;
        const totalItems = dataEstagios.meta?.itemCount || dataEstagios.meta?.totalItems || dataEstagios.total;

        if (pageCount) {
          setTotalPaginas(Math.max(1, pageCount));
        } else if (totalItems !== undefined) {
          setTotalPaginas(Math.max(1, Math.ceil(totalItems / itensPorPagina)));
        } else {
          setTotalPaginas(1);
        }
      } catch (error) {
        if (!cancelado) {
          console.error("Erro ao buscar vagas:", error);
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    }

    carregarVagas();

    return () => {
      cancelado = true;
    };
  }, [pagina, busca]);

  // Executa exclusão da vaga selecionada
  async function handleDeletar() {
    if (!vagaSelecionada) return;

    setDeletando(true);
    try {
      const response = await apiFetch(`/estagios/${vagaSelecionada.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const erroDados = await response.json().catch(() => null);
        throw new Error(
          erroDados?.message || erroDados?.mensagem || "Não foi possível excluir a vaga de estágio."
        );
      }

      alert("Vaga excluída com sucesso!");

      setVagas((prev) => prev.filter((v) => v.id !== vagaSelecionada.id));
      setModalAberto(false);
      setVagaSelecionada(null);

      if (vagas.length === 1 && pagina > 1) {
        setPagina((p) => p - 1);
      }
    } catch (error) {
      console.error("Erro ao excluir vaga:", error);
      alert(error.message || "Ocorreu um erro ao tentar excluir a vaga.");
      setModalAberto(false);
      setVagaSelecionada(null);
    } finally {
      setDeletando(false);
    }
  }

  // Renderiza a badge do status da vaga
  function renderBadgeStatus(status) {
    switch (status) {
      case "DISPONIVEL":
        return <span className={`${Styles.badge} ${Styles.statusAberta}`}>Aberta</span>;
      case "EM_ANDAMENTO":
        return <span className={`${Styles.badge} ${Styles.statusAndamento}`}>Em Andamento</span>;
      default:
        return <span className={`${Styles.badge} ${Styles.statusFechada}`}>Fechada</span>;
    }
  }

  return (
    <div className={Styles.container}>
      {/* Barra de Pesquisa */}
      <div className={Styles.searchContainer}>
        <PesquisaIcon size={36} className={Styles.searchIcon} />
        <input
          type="text"
          placeholder="Buscar por empresa, curso, campus ou supervisor..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPagina(1);
          }}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", margin: "20px 0" }}>Carregando vagas...</p>
      ) : (
        <>
          {/* Tabela de Vagas */}
          <table className={Styles.table}>
            <thead>
              <tr>
                <th>Campus</th>
                <th>Empresa</th>
                <th>Curso</th>
                <th>Carga Horária</th>
                <th>Supervisor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {vagas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Nenhuma vaga encontrada.
                  </td>
                </tr>
              ) : (
                vagas.map((vaga) => (
                  <tr key={vaga.id}>
                    <td>{vaga.campusNome}</td>
                    <td>{vaga.empresaNome}</td>
                    <td>{vaga.cursoNome}</td>
                    <td>{vaga.cargaHoraria}h</td>
                    <td>{vaga.nomeSupervisor}</td>
                    <td>{renderBadgeStatus(vaga.status)}</td>
                    <td className={Styles.actions}>
                      <button onClick={() => navigate(`/vagas/editar/${vaga.id}`)}>
                        <EditarIcon size={20} />
                      </button>

                      <button
                        onClick={() => {
                          setVagaSelecionada(vaga);
                          setModalAberto(true);
                        }}
                      >
                        <DeletarIcon size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Paginação Server-side */}
          <div className={Styles.pagination}>
            <button
              disabled={pagina === 1 || loading}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>

            <span>
              Página {pagina} de {totalPaginas}
            </span>

            <button
              disabled={pagina >= totalPaginas || loading}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {modalAberto && (
        <div className={Styles.overlay}>
          <div className={Styles.modal}>
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza de que deseja excluir a vaga da empresa{" "}
              <strong>{vagaSelecionada?.empresaNome}</strong>? Esta ação é irreversível.
            </p>
            <div className={Styles.modalButtons}>
              <button
                className={Styles.cancelButton}
                onClick={() => {
                  setModalAberto(false);
                  setVagaSelecionada(null);
                }}
                disabled={deletando}
              >
                Cancelar
              </button>
              <button
                className={Styles.deleteButton}
                onClick={handleDeletar}
                disabled={deletando}
              >
                {deletando ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

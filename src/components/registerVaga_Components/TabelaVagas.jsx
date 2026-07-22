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
  const itensPorPagina = 10;

  // Estados do modal de exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);

  // Busca as vagas e dados relacionados da API no carregamento do componente
  useEffect(() => {
    async function carregarVagas() {
      setLoading(true);
      try {
        // Busca estágios (vagas), empresas, cursos e campi em paralelo para associar
        const [resEstagios, resEmpresas, resCursos, resCampi] = await Promise.all([
          apiFetch("/estagios?page=1&limit=1000"),
          apiFetch("/empresas?page=1&limit=1000"),
          apiFetch("/cursos?page=1&limit=1000"),
          apiFetch("/campi?page=1&limit=1000"),
        ]);

        if (!resEstagios.ok) {
          throw new Error("Erro ao carregar lista de vagas.");
        }

        const dataEstagios = await resEstagios.json();
        const dataEmpresas = await resEmpresas.json().catch(() => ({ data: [] }));
        const dataCursos = await resCursos.json().catch(() => ({ data: [] }));
        const dataCampi = await resCampi.json().catch(() => ({ data: [] }));

        // Cria mapas para buscas O(1)
        const empresasMap = new Map((dataEmpresas.data || []).map((emp) => [emp.id, emp]));
        const cursosMap = new Map((dataCursos.data || []).map((c) => [c.id, c]));
        const campiMap = new Map((dataCampi.data || []).map((cam) => [cam.id, cam]));

        // Formata e unifica as vagas
        const listaVagas = (dataEstagios.data || []).map((item) => {
          const empresaObj = item.empresa?.id ? empresasMap.get(item.empresa.id) : null;
          const cursoObj = item.CursoReferencia?.id ? cursosMap.get(item.CursoReferencia.id) : null;
          const campusObj = item.campus?.id ? campiMap.get(item.campus.id) : null;

          const empresaNome = item.empresa?.nomeFantasia || item.empresa?.razaoSocial || empresaObj?.nomeFantasia || empresaObj?.razaoSocial || "Não informada";
          const cursoNome = item.CursoReferencia?.nomeAbreviado || item.CursoReferencia?.nome || cursoObj?.nomeAbreviado || cursoObj?.nome || "Não informado";
          const campusNome = item.campus?.nomeFantasia || item.campus?.razaoSocial || campusObj?.nomeFantasia || campusObj?.razaoSocial || "Não informado";

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
      } catch (error) {
        console.error("Erro ao buscar vagas:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarVagas();
  }, []);

  // Filtra as vagas com base na pesquisa (Empresa, Curso, Campus ou Supervisor)
  const vagasFiltradas = vagas.filter((vaga) => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return true;

    return (
      vaga.empresaNome.toLowerCase().includes(termo) ||
      vaga.cursoNome.toLowerCase().includes(termo) ||
      vaga.campusNome.toLowerCase().includes(termo) ||
      vaga.nomeSupervisor.toLowerCase().includes(termo)
    );
  });

  // Paginação dos dados filtrados
  const totalPaginas = Math.ceil(vagasFiltradas.length / itensPorPagina) || 1;
  const indiceInicial = (pagina - 1) * itensPorPagina;
  const vagasPaginadas = vagasFiltradas.slice(indiceInicial, indiceInicial + itensPorPagina);

  // Executa exclusão da vaga selecionada
  async function handleDeletar() {
    if (!vagaSelecionada) return;

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

      // Remove a vaga localmente do estado
      setVagas(vagas.filter((v) => v.id !== vagaSelecionada.id));
      setModalAberto(false);
      setVagaSelecionada(null);

      // Recalcula página ativa se necessário
      if (vagasPaginadas.length === 1 && pagina > 1) {
        setPagina(pagina - 1);
      }
    } catch (error) {
      console.error("Erro ao excluir vaga:", error);
      alert(error.message || "Ocorreu um erro ao tentar excluir a vaga.");
      setModalAberto(false);
      setVagaSelecionada(null);
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
            setPagina(1); // Reinicia para a primeira página ao pesquisar
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
              {vagasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    Nenhuma vaga encontrada.
                  </td>
                </tr>
              ) : (
                vagasPaginadas.map((vaga) => (
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

          {/* Paginação */}
          <div className={Styles.pagination}>
            <button 
              disabled={pagina === 1} 
              onClick={() => setPagina(pagina - 1)}
            >
              Anterior
            </button>

            <span>
              Página {pagina} de {totalPaginas}
            </span>

            <button 
              disabled={pagina === totalPaginas || totalPaginas === 0} 
              onClick={() => setPagina(pagina + 1)}
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
              >
                Cancelar
              </button>
              <button 
                className={Styles.deleteButton} 
                onClick={handleDeletar}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Styles from "./tabelaVagas.module.css";
import PesquisaIcon from "../icons_Components/Icon_Pesquisa_Comp";
import EditarIcon from "../icons_Components/Icon_Editar_Comp";
import DeletarIcon from "../icons_Components/Icon_Deletar_Comp";
import apiFetch from "../../utils/api";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
} from "../ui";

export default function TabelaVagas() {
  const navigate = useNavigate();

  // Estados dos dados e carregamento
  const [todasVagas, setTodasVagas] = useState([]); // lista completa vinda da API
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 10;

  // Estados do modal de exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [deletando, setDeletando] = useState(false);

  // Busca TODAS as vagas da API (paginação client-side)
  // A API /estagios não retorna metadados de paginação, por isso buscamos
  // todos os registros disponíveis de uma vez e paginamos localmente.
  useEffect(() => {
    let cancelado = false;

    async function carregarVagas() {
      setLoading(true);
      setErro(null);

      try {
        // Busca estágios e tabelas auxiliares para enriquecer exibição
        const [resEstagios, resEmpresas, resCursos, resCampi] = await Promise.all([
          apiFetch("/estagios?limit=100"),
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

        setTodasVagas(listaVagas);
      } catch (error) {
        if (!cancelado) {
          console.error("Erro ao buscar vagas:", error);
          setErro(error.message || "Erro ao carregar vagas. Tente novamente.");
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
  }, []); // Busca uma única vez ao montar o componente

  // Filtragem client-side por busca
  const vagasFiltradas = todasVagas.filter((vaga) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      vaga.empresaNome.toLowerCase().includes(termo) ||
      vaga.cursoNome.toLowerCase().includes(termo) ||
      vaga.campusNome.toLowerCase().includes(termo) ||
      vaga.nomeSupervisor.toLowerCase().includes(termo)
    );
  });

  // Paginação client-side
  const totalPaginas = Math.max(1, Math.ceil(vagasFiltradas.length / itensPorPagina));
  const vagasPaginadas = vagasFiltradas.slice(
    (pagina - 1) * itensPorPagina,
    pagina * itensPorPagina
  );

  // Reseta para página 1 ao buscar
  function handleBusca(valor) {
    setBusca(valor);
    setPagina(1);
  }

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

      setTodasVagas((prev) => prev.filter((v) => v.id !== vagaSelecionada.id));
      setModalAberto(false);
      setVagaSelecionada(null);

      // Ajusta a página se a página atual ficar vazia após a exclusão
      const novoTotal = vagasFiltradas.length - 1;
      const novasTotalPaginas = Math.max(1, Math.ceil(novoTotal / itensPorPagina));
      if (pagina > novasTotalPaginas) {
        setPagina(novasTotalPaginas);
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
        return <Badge tone="success">Aberta</Badge>;
      case "EM_ANDAMENTO":
        return <Badge tone="info">Em Andamento</Badge>;
      default:
        return <Badge tone="danger">Fechada</Badge>;
    }
  }

  return (
    <div className={Styles.container}>
      {/* Barra de Pesquisa */}
      <div className={Styles.searchContainer}>
        <PesquisaIcon size={36} className={Styles.searchIcon} aria-hidden="true" />
        <Input
          aria-label="Buscar por empresa, curso, campus ou supervisor"
          placeholder="Buscar por empresa, curso, campus ou supervisor..."
          value={busca}
          onChange={(e) => handleBusca(e.target.value)}
          className={Styles.searchInput}
        />
      </div>

      {loading ? (
        <LoadingState message="Carregando vagas..." rows={4} />
      ) : erro ? (
        <ErrorState
          title="Não foi possível carregar as vagas"
          message={erro}
          onRetry={() => window.location.reload()}
          retryLabel="Tentar novamente"
        />
      ) : (
        <>
          {/* Contador de resultados */}
          <p className={Styles.contador}>
            {busca.trim()
              ? `${vagasFiltradas.length} vaga(s) encontrada(s) para "${busca}"`
              : `${todasVagas.length} vaga(s) cadastrada(s) no total`}
          </p>

          {vagasPaginadas.length === 0 ? (
            <EmptyState
              title={busca ? `Nenhuma vaga encontrada para "${busca}".` : "Nenhuma vaga cadastrada."}
            />
          ) : (
            <div className={Styles.tableWrapper}>
              <table className={Styles.table}>
                <caption className="sr-only">Lista de vagas de estágio</caption>
                <thead>
                  <tr>
                    <th scope="col">Campus</th>
                    <th scope="col">Empresa</th>
                    <th scope="col">Curso</th>
                    <th scope="col">Carga Horária</th>
                    <th scope="col">Supervisor</th>
                    <th scope="col">Status</th>
                    <th scope="col">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {vagasPaginadas.map((vaga) => (
                    <tr key={vaga.id}>
                      <td>{vaga.campusNome}</td>
                      <td>{vaga.empresaNome}</td>
                      <td>{vaga.cursoNome}</td>
                      <td>{vaga.cargaHoraria}h</td>
                      <td>{vaga.nomeSupervisor}</td>
                      <td>{renderBadgeStatus(vaga.status)}</td>
                      <td className={Styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Editar vaga de ${vaga.empresaNome}`}
                          onClick={() => navigate(`/vagas/editar/${vaga.id}`)}
                        >
                          <EditarIcon size={20} aria-hidden="true" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Excluir vaga de ${vaga.empresaNome}`}
                          onClick={() => {
                            setVagaSelecionada(vaga);
                            setModalAberto(true);
                          }}
                        >
                          <DeletarIcon size={20} aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação Client-side */}
          {totalPaginas > 1 && (
            <div className={Styles.pagination}>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagina === 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>

              <span>
                Página {pagina} de {totalPaginas}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        open={modalAberto}
        onCancel={() => {
          setModalAberto(false);
          setVagaSelecionada(null);
        }}
        onConfirm={handleDeletar}
        title="Confirmar exclusão"
        description={`Tem certeza de que deseja excluir a vaga da empresa ${vagaSelecionada?.empresaNome ?? ""}? Esta ação é irreversível.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        tone="danger"
        loading={deletando}
      />
    </div>
  );
}

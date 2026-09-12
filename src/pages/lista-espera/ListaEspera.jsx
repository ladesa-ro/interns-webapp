import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./listaEspera.module.css";

import Cards from "../../components/global_Components/Cards";
import Tabela from "../../components/global_Components/Tabela";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../components/ui";
import { buscarListaDeEspera } from "../../utils/dashboardApi";

import logoQuimica from "../../assets/imagems/quimica.png";
import logoinformtica from "../../assets/imagems/informatica.png";
import logofloresta from "../../assets/imagems/floresta.png";

function pertenceAoCurso(nomeCurso, curso) {
  return nomeCurso
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes(curso.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
}

function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function ListaEspera() {
  const navigate = useNavigate();

  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [busca, setBusca] = useState("");

  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [recarga, setRecarga] = useState(0);

  // FIX BUG 1: usa variável local `ativo` ao invés de ref compartilhada.
  // A ref era definida como false no cleanup mas nunca voltava a true no
  // próximo effect — causando carregamentos silenciosamente abortados.
  const recarregar = useCallback(() => setRecarga((v) => v + 1), []);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro(null);
      try {
        const dados = await buscarListaDeEspera();
        if (ativo) setAlunos(dados);
      } catch (error) {
        if (ativo) setErro(error);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [recarga]);

  // FIX BUG 2: usa "Florestas" (com 's') em todos os filtros.
  // O counter do card usava "Floresta" (sem 's') e o filtro usava "Florestas",
  // causando contagem diferente da tabela filtrada.
  const contarPorCurso = (curso) =>
    alunos.filter((aluno) => pertenceAoCurso(aluno.curso, curso)).length;

  const alunosFiltradosPorCurso = cursoSelecionado
    ? alunos.filter((aluno) => pertenceAoCurso(aluno.curso, cursoSelecionado))
    : alunos;

  // Melhoria 1: busca client-side por nome ou matrícula.
  const termoBusca = normalizarTexto(busca);
  const alunosFiltrados = termoBusca
    ? alunosFiltradosPorCurso.filter(
        (aluno) =>
          normalizarTexto(aluno.nome).includes(termoBusca) ||
          normalizarTexto(aluno.matricula).includes(termoBusca)
      )
    : alunosFiltradosPorCurso;

  // Melhoria 2: coluna "Curso" adicionada.
  const colunas = [
    { label: "Matrícula", chave: "matricula" },
    { label: "Nome", chave: "nome" },
    { label: "Curso", chave: "curso" },
    { label: "Empresa", chave: "empresa" },
  ];

  const selecionarCurso = (curso) => {
    setCursoSelecionado((atual) => (atual === curso ? null : curso));
  };

  // FIX BUG 3: mensagem diferenciada para lista vazia sem filtro.
  function mensagemVazia() {
    if (termoBusca) return `Nenhum resultado para "${busca}"`;
    if (cursoSelecionado) return `Nenhum aluno de ${cursoSelecionado} na lista de espera`;
    return "Nenhum aluno na lista de espera";
  }

  return (
    <div className={styles.layout}>
      <main className={styles.container}>
        <PageHeader
          title="Lista de espera"
          actions={
            <button
              type="button"
              className={styles.voltar}
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
          }
        />

        <div className={styles.cards}>
          <button
            type="button"
            className={[styles.cardWrapper, cursoSelecionado === "Informática" ? styles.cardAtivo : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => selecionarCurso("Informática")}
            aria-pressed={cursoSelecionado === "Informática"}
            aria-label="Filtrar por Informática"
          >
            <Cards titulo="Informática" valor={contarPorCurso("Informática")} imagem={logoinformtica} />
          </button>

          <button
            type="button"
            className={[styles.cardWrapper, cursoSelecionado === "Química" ? styles.cardAtivo : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => selecionarCurso("Química")}
            aria-pressed={cursoSelecionado === "Química"}
            aria-label="Filtrar por Química"
          >
            <Cards titulo="Química" valor={contarPorCurso("Química")} imagem={logoQuimica} />
          </button>

          <button
            type="button"
            className={[styles.cardWrapper, cursoSelecionado === "Florestas" ? styles.cardAtivo : ""]
              .filter(Boolean)
              .join(" ")}
            onClick={() => selecionarCurso("Florestas")}
            aria-pressed={cursoSelecionado === "Florestas"}
            aria-label="Filtrar por Florestas"
          >
            <Cards titulo="Florestas" valor={contarPorCurso("Florestas")} imagem={logofloresta} />
          </button>
        </div>

        {carregando ? (
          <LoadingState message="Carregando lista de espera..." rows={4} />
        ) : erro ? (
          <ErrorState
            title="Não foi possível carregar a lista de espera"
            message="Verifique sua conexão e tente novamente."
            onRetry={recarregar}
          />
        ) : (
          <>
            <div className={styles.barraBusca}>
              <Search size={18} aria-hidden="true" className={styles.iconeBusca} />
              <input
                id="busca-lista-espera"
                type="search"
                className={styles.inputBusca}
                placeholder="Buscar por nome ou matrícula…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar aluno por nome ou matrícula"
              />
            </div>

            {alunosFiltrados.length > 0 ? (
              <Tabela colunas={colunas} dados={alunosFiltrados} />
            ) : (
              <EmptyState title={mensagemVazia()} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
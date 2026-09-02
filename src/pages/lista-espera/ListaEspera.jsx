import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
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

export default function ListaEspera() {
  const navigate = useNavigate();

  const [cursoSelecionado, setCursoSelecionado] = useState(null);

  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const ativoRef = useRef(true);

  const carregarAlunos = useCallback(async () => {
    if (!ativoRef.current) return;
    setCarregando(true);
    setErro(null);
    try {
      const dados = await buscarListaDeEspera();
      if (ativoRef.current) setAlunos(dados);
    } catch (error) {
      if (ativoRef.current) setErro(error);
    } finally {
      if (ativoRef.current) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const tarefa = Promise.resolve().then(carregarAlunos);
    return () => {
      ativoRef.current = false;
      tarefa.catch(() => {});
    };
  }, [carregarAlunos]);

  const alunosFiltrados = cursoSelecionado
    ? alunos.filter((aluno) => pertenceAoCurso(aluno.curso, cursoSelecionado))
    : alunos;

  const colunas = [
    {
      label: "Matrícula",
      chave: "matricula",
    },
    {
      label: "Nome",
      chave: "nome",
    },
    {
      label: "Empresa",
      chave: "empresa",
    },
  ];

  const selecionarCurso = (curso) => {
    if (cursoSelecionado === curso) {
      setCursoSelecionado(null);
      return;
    }

    setCursoSelecionado(curso);
  };

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
            <Cards titulo="Informática" valor={alunos.filter((aluno) => pertenceAoCurso(aluno.curso, "Informática")).length} imagem={logoinformtica} />
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
            <Cards titulo="Química" valor={alunos.filter((aluno) => pertenceAoCurso(aluno.curso, "Química")).length} imagem={logoQuimica} />
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
            <Cards titulo="Florestas" valor={alunos.filter((aluno) => pertenceAoCurso(aluno.curso, "Floresta")).length} imagem={logofloresta} />
          </button>
        </div>

        {carregando ? (
          <LoadingState message="Carregando lista de espera..." rows={4} />
        ) : erro ? (
          <ErrorState
            title="Não foi possível carregar a lista de espera"
            message="Verifique sua conexão e tente novamente."
            onRetry={carregarAlunos}
          />
        ) : alunosFiltrados.length > 0 ? (
          <Tabela
            colunas={colunas}
            dados={alunosFiltrados}
          />
        ) : (
          <EmptyState
            title={`Nenhum aluno de ${cursoSelecionado} na lista de espera`}
          />
        )}
      </main>
    </div>
  );
}
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Tabela from "../../components/global_Components/Tabela";
import Cards from "../../components/global_Components/Cards.jsx";
import apiFetch from "../../utils/api";
import { EmptyState, LoadingState, PageHeader } from "../../components/ui";

import styles from "./vaga.module.css";
import logoQuimica from "../../assets/imagems/quimica.png";
import logoinformtica from "../../assets/imagems/informatica.png";
import logofloresta from "../../assets/imagems/floresta.png";

export default function Vaga() {
  const navigate = useNavigate();
  const [filtroCurso, setFiltroCurso] = useState("");
  const [vagas, setVagas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarVagas() {
      setLoading(true);
      try {
        // BUSCA EM PARALELO (PROMISE.ALL)
        const [responseEstagios, responseEmpresas, responseCursos] = await Promise.all([
          apiFetch("/estagios?page=1&limit=1000"),
          apiFetch("/empresas?page=1&limit=1000"),
          apiFetch("/cursos?page=1&limit=1000"),
        ]);

        const [dataEstagios, dataEmpresas, dataCursos] = await Promise.all([
          responseEstagios.json(),
          responseEmpresas.json(),
          responseCursos.json(),
        ]);

        // CRIA MAPAS PARA BUSCA EFICIENTE O(1)
        const empresasMap = new Map(
          (dataEmpresas.data || []).map((empresa) => [empresa.id, empresa])
        );
        const cursosMap = new Map(
          (dataCursos.data || []).map((curso) => [curso.id, curso])
        );

        // FORMATA DADOS
        const vagasFormatadas = (dataEstagios.data || []).map((item) => {
          const empresaEncontrada = item.empresa?.id ? empresasMap.get(item.empresa.id) : null;
          const cursoEncontrado = item.CursoReferencia?.id
            ? cursosMap.get(item.CursoReferencia.id)
            : null;

          return {
            id: item.id,
            empresa:
              empresaEncontrada?.nomeFantasia ||
              empresaEncontrada?.razaoSocial ||
              "Empresa não informada",
            curso:
              cursoEncontrado?.nomeAbreviado ||
              cursoEncontrado?.nome ||
              "Curso não informado",
            vagas: item.cargaHoraria ? `${item.cargaHoraria}h` : "Não informado",
          };
        });

        setVagas(vagasFormatadas);
      } catch (erro) {
        console.error("Erro ao buscar vagas:", erro);
      } finally {
        setLoading(false);
      }
    }

    buscarVagas();
  }, []);

  // CONTA AS VAGAS DINAMICAMENTE PARA CADA CURSO
  const countInformatica = vagas.filter(
    (v) =>
      v.curso.toLowerCase().includes("informática") ||
      v.curso.toLowerCase().includes("info")
  ).length;

  const countQuimica = vagas.filter(
    (v) =>
      v.curso.toLowerCase().includes("química") ||
      v.curso.toLowerCase().includes("quim")
  ).length;

  const countFloresta = vagas.filter(
    (v) =>
      v.curso.toLowerCase().includes("floresta") ||
      v.curso.toLowerCase().includes("flor")
  ).length;

  // TOGGLE DE FILTRO
  const selecionarFiltroCurso = (curso) => {
    if (filtroCurso === curso) {
      setFiltroCurso("");
    } else {
      setFiltroCurso(curso);
    }
  };

  const vagasFiltradas = filtroCurso
    ? vagas.filter((vaga) => vaga.curso.toLowerCase().includes(filtroCurso.toLowerCase()))
    : vagas;

  const colunas = [
    { label: "Empresa", chave: "empresa" },
    { label: "Curso", chave: "curso" },
    { label: "Carga Horária / Detalhes", chave: "vagas" },
  ];

  return (
    <div className={styles.layout}>
      <main className={styles.vagaContainer}>
        <PageHeader
          title="Painel CIEC"
          description="Vagas Disponíveis"
          actions={
            <button
              type="button"
              className={styles.voltar}
              onClick={() => navigate("/")}
              aria-label="Voltar ao painel"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
          }
        />

        <div className={styles.conteudoCentral}>
          <div className={styles.cards}>
            <button
              type="button"
              className={[styles.cardWrapper, filtroCurso === "Informática" ? styles.cardAtivo : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selecionarFiltroCurso("Informática")}
              aria-pressed={filtroCurso === "Informática"}
              aria-label="Filtrar por Informática"
            >
              <Cards imagem={logoinformtica} titulo="Informática" valor={countInformatica} />
            </button>

            <button
              type="button"
              className={[styles.cardWrapper, filtroCurso === "Química" ? styles.cardAtivo : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selecionarFiltroCurso("Química")}
              aria-pressed={filtroCurso === "Química"}
              aria-label="Filtrar por Química"
            >
              <Cards imagem={logoQuimica} titulo="Química" valor={countQuimica} />
            </button>

            <button
              type="button"
              className={[styles.cardWrapper, filtroCurso === "Floresta" ? styles.cardAtivo : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selecionarFiltroCurso("Floresta")}
              aria-pressed={filtroCurso === "Floresta"}
              aria-label="Filtrar por Floresta"
            >
              <Cards imagem={logofloresta} titulo="Floresta" valor={countFloresta} />
            </button>
          </div>

          <div className={styles.tabelaContainer}>
            {loading ? (
              <LoadingState message="Carregando vagas..." rows={4} />
            ) : vagasFiltradas.length > 0 ? (
              <Tabela colunas={colunas} dados={vagasFiltradas} />
            ) : (
              <EmptyState title="Nenhuma vaga encontrada para o curso selecionado." />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
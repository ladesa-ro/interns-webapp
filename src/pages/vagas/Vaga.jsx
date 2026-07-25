import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Tabela from "../../components/global_Components/Tabela";
import Cards from "../../components/global_Components/Cards.jsx";
import apiFetch from "../../utils/api";

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
        <div className={styles.topo}>
          <div className={styles.tituloArea}>
            <button className={styles.voltar} onClick={() => navigate("/")}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1>Painel CIEC</h1>
              <p>Vagas Disponíveis</p>
            </div>
          </div>
        </div>

        <div className={styles.conteudoCentral}>
          <div className={styles.cards}>
            <div
              className={`${styles.cardWrapper} ${filtroCurso === "Informática" ? styles.cardAtivo : ""}`}
              onClick={() => selecionarFiltroCurso("Informática")}
            >
              <Cards imagem={logoinformtica} titulo="Informática" valor={countInformatica} />
            </div>

            <div
              className={`${styles.cardWrapper} ${filtroCurso === "Química" ? styles.cardAtivo : ""}`}
              onClick={() => selecionarFiltroCurso("Química")}
            >
              <Cards imagem={logoQuimica} titulo="Química" valor={countQuimica} />
            </div>

            <div
              className={`${styles.cardWrapper} ${filtroCurso === "Floresta" ? styles.cardAtivo : ""}`}
              onClick={() => selecionarFiltroCurso("Floresta")}
            >
              <Cards imagem={logofloresta} titulo="Floresta" valor={countFloresta} />
            </div>
          </div>

          <div className={styles.tabelaContainer}>
            {loading ? (
              <p style={{ textAlign: "center", marginTop: "20px" }}>Carregando vagas...</p>
            ) : vagasFiltradas.length > 0 ? (
              <Tabela colunas={colunas} dados={vagasFiltradas} />
            ) : (
              <div
                style={{
                  background: "#fff",
                  padding: "30px",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: "0px 4px 12px rgba(0,0,0,.08)",
                }}
              >
                Nenhuma vaga encontrada para o curso selecionado.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
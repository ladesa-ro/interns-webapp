import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useState,
  useEffect,
} from "react";

import Tabela from "../../components/global_Components/Tabela";

import Cards from "../../components/global_Components/Cards.jsx";

import styles from "./vaga.module.css";

import logoQuimica from "../../assets/imagems/quimica.png";
import logoinformtica from "../../assets/imagems/informatica.png";
import logofloresta from "../../assets/imagems/floresta.png";

export default function Vaga() {

  const navigate = useNavigate();

  const [filtroCurso, setFiltroCurso] = useState("");

  const [vagas, setVagas] = useState([]);

  useEffect(() => {

    buscarVagas();

  }, []);

  async function buscarVagas() {

    try {

      // =========================
      // BUSCA ESTÁGIOS
      // =========================

      const responseEstagios = await fetch(
        "https://dev.ladesa.com.br/api/v1/estagios"
      );

      const dataEstagios =
        await responseEstagios.json();

      console.log(
        "ESTÁGIOS:",
        dataEstagios
      );

      // =========================
      // BUSCA EMPRESAS
      // =========================

      const responseEmpresas = await fetch(
        "https://dev.ladesa.com.br/api/v1/empresas"
      );

      const dataEmpresas =
        await responseEmpresas.json();

      console.log(
        "EMPRESAS:",
        dataEmpresas
      );

      // =========================
      // BUSCA CURSOS
      // =========================

      const responseCursos = await fetch(
        "https://dev.ladesa.com.br/api/v1/cursos"
      );

      const dataCursos =
        await responseCursos.json();

      console.log(
        "CURSOS:",
        dataCursos
      );

      // =========================
      // FORMATA DADOS
      // =========================

      const vagasFormatadas =
        dataEstagios.data.map((item) => {

          console.log(
            "ITEM ESTÁGIO:",
            item
          );

          // =========================
          // EMPRESA
          // =========================

          const empresaEncontrada =
            dataEmpresas.data.find(
              (empresa) =>
                empresa.id ===
                item.empresa?.id
            );

          // =========================
          // CURSO
          // =========================

          const cursoEncontrado =
            dataCursos.data.find(
              (curso) =>
                curso.id ===
                item.CursoReferencia?.id
            );

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

            vagas:
              item.cargaHoraria
                ? `${item.cargaHoraria}h`
                : "Não informado",

          };

        });

      console.log(
        "VAGAS FORMATADAS:",
        vagasFormatadas
      );

      setVagas(vagasFormatadas);

    } catch (erro) {

      console.error(
        "Erro ao buscar vagas:",
        erro
      );

    }

  }

  // =========================
  // FILTRO
  // =========================

  const vagasFiltradas =
    filtroCurso
      ? vagas.filter(
        (vaga) =>
          vaga.curso === filtroCurso
      )
      : vagas;

  // =========================
  // COLUNAS TABELA
  // =========================

  const colunas = [

    {
      label: "Empresa",
      chave: "empresa",
    },

    {
      label: "Curso",
      chave: "curso",
    },

    {
      label: "Vaga",
      chave: "vagas",
    },

  ];

  return (

    <div className={styles.layout}>

      <main className={styles.vagaContainer}>

        {/* ========================= */}
        {/* TOPO */}
        {/* ========================= */}

        <div className={styles.topo}>

          <div className={styles.tituloArea}>

            <button
              className={styles.voltar}
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={20} />
            </button>

            <div>

              <h1>Painel CIEC</h1>

              <p>
                Vagas Disponíveis
              </p>

            </div>

          </div>

        </div>

        {/* ========================= */}
        {/* CONTEÚDO so pra sar commit */}
        {/* ========================= */}

        <div className={styles.conteudoCentral}>

          {/* ========================= */}
          {/* CARDS */}
          {/* ========================= */}

          <div className={styles.cards}>

            <div
              onClick={() =>
                setFiltroCurso(
                  "Informática"
                )
              }
            >
              <Cards
                imagem={logoinformtica}
                titulo="Informática"
                valor="24"
              />
            </div>

            <div
              onClick={() =>
                setFiltroCurso(
                  "Química"
                )
              }
            >
              <Cards
                imagem={logoQuimica}
                titulo="Química"
                valor="24"
              />
            </div>

            <div
              onClick={() =>
                setFiltroCurso(
                  "Floresta"
                )
              }
            >
              <Cards
                imagem={logofloresta}
                titulo="Floresta"
                valor="24"
              />
            </div>

          </div>

          {/* ========================= */}
          {/* TABELA */}
          {/* ========================= */}

          <div className={styles.tabelaContainer}>

            <Tabela
              colunas={colunas}
              dados={vagasFiltradas}
            />

          </div>

        </div>

      </main>

    </div>

  );

}
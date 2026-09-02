import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./listaEspera.module.css";

import Cards from "../../components/global_Components/Cards";
import Tabela from "../../components/global_Components/Tabela";
import { EmptyState, PageHeader } from "../../components/ui";

import logoQuimica from "../../assets/imagems/quimica.png";
import logoinformtica from "../../assets/imagems/informatica.png";
import logofloresta from "../../assets/imagems/floresta.png";

export default function ListaEspera() {
  const navigate = useNavigate();

  const [cursoSelecionado, setCursoSelecionado] = useState(null);

  const [alunos] = useState([
    {
      matricula: "2025102020039",
      nome: "Ana Cristina Souza",
      empresa: "IFRO",
      curso: "Informática",
    },
    {
      matricula: "2025102020040",
      nome: "Uriel Luiz",
      empresa: "Laboratório BioVida",
      curso: "Química",
    },
    {
      matricula: "2025102020041",
      nome: "Victor Henrique",
      empresa: "Laboratório BioVida",
      curso: "Química",
    },
    {
      matricula: "2025102020042",
      nome: "Arthur Braga",
      empresa: "Quimlab Análises",
      curso: "Florestas",
    },
    {
      matricula: "2025102020043",
      nome: "Juliana Rodrigues",
      empresa: "IFRO",
      curso: "Informática",
    },
  ]);

  const alunosFiltrados = cursoSelecionado
    ? alunos.filter(
      (aluno) => aluno.curso === cursoSelecionado
    )
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
            <Cards titulo="Informática" valor="24" imagem={logoinformtica} />
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
            <Cards titulo="Química" valor="24" imagem={logoQuimica} />
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
            <Cards titulo="Florestas" valor="24" imagem={logofloresta} />
          </button>
        </div>

        {alunosFiltrados.length > 0 ? (
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
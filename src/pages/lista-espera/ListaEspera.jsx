import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "./listaEspera.module.css";

import Cards from "../../components/global_Components/Cards";
import Tabela from "../../components/global_Components/Tabela";

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
        <div className={styles.topo}>
          <button
            className={styles.voltar}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>

          <h1>Lista de espera</h1>
        </div>

        <div className={styles.cards}>
          <div
            className={`${styles.cardWrapper} ${cursoSelecionado === "Informática"
                ? styles.cardAtivo
                : ""
              }`}
            onClick={() => selecionarCurso("Informática")}
          >
            <Cards
              titulo="Informática"
              valor="24"
              imagem={logoinformtica}
            />
          </div>

          <div
            className={`${styles.cardWrapper} ${cursoSelecionado === "Química"
                ? styles.cardAtivo
                : ""
              }`}
            onClick={() => selecionarCurso("Química")}
          >
            <Cards
              titulo="Química"
              valor="24"
              imagem={logoQuimica}
            />
          </div>

          <div
            className={`${styles.cardWrapper} ${cursoSelecionado === "Florestas"
                ? styles.cardAtivo
                : ""
              }`}
            onClick={() => selecionarCurso("Florestas")}
          >
            <Cards
              titulo="Florestas"
              valor="24"
              imagem={logofloresta}
            />
          </div>
        </div>

        <Tabela
          colunas={colunas}
          dados={alunosFiltrados}
        />
      </main>
    </div>
  );
}
import { useState } from "react";
import styles from "./alunosSemEstagio.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Cards from "../../components/global_Components/Cards";
import Tabela from "../../components/global_Components/Tabela";

export default function AlunosSemEstagio() {
  const navigate = useNavigate();

  const [alunos] = useState([
    {
      matricula: "2024102020039",
      nome: "Carla Mendes",
      turma: "3º B Química",
    },
    {
      matricula: "2024102020040",
      nome: "Eduardo Alves Souza",
      turma: "3º A Floresta",
    },
    {
      matricula: "2024102020041",
      nome: "Gabriela Ferreira Costa",
      turma: "3º A Floresta",
    },
    {
      matricula: "2024102020042",
      nome: "João Pedro Gomes",
      turma: "3º A Informática",
    },
    {
      matricula: "2024102020043",
      nome: "Miguel Cabral",
      turma: "3º A Informática",
    },
    {
      matricula: "2024102020044",
      nome: "Luís Maciel",
      turma: "3º A Química",
    },
  ]);

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
      label: "Turma",
      chave: "turma",
    },
  ];

  return (
    <div className={styles.layout}>
      <main className={styles.alunosContainer}>
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
              <p>Alunos do 3º Ano sem estágio</p>
            </div>
          </div>
        </div>

        <div className={styles.cards}>
          <Cards
            titulo="Total de alunos"
            valor={alunos.length}
            cor="blue"
          />

          <Cards
            titulo="Estágios concluídos"
            valor="24"
            cor="green"
          />

          <Cards
            titulo="Em andamento"
            valor="24"
            cor="orange"
          />

          <Cards
            titulo="Não realizado"
            valor={alunos.length}
            cor="red"
          />
        </div>

        <Tabela
          colunas={colunas}
          dados={alunos}
        />
      </main>
    </div>
  );
}
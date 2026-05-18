
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import Cards from "../../components/global_Components/Cards.jsx";
import Tabela from "../../components/global_Components/Tabela";

import styles from "./alunos-em-estagio.module.css";

export default function AlunosEmEstagio() {
  const navigate = useNavigate();

  const [alunos] = useState([
    {
      matricula: "20231001",
      nome: "João Victor",
      turma: "INFO 3A",
      empresa: "Tech Solutions",
    },
    {
      matricula: "20231002",
      nome: "Maria Eduarda",
      turma: "QUIM 2B",
      empresa: "Lab Química Brasil",
    },
    {
      matricula: "20231003",
      nome: "Carlos Henrique",
      turma: "FLO 3A",
      empresa: "EcoFlorestal",
    },
    {
      matricula: "20231004",
      nome: "Ana Clara",
      turma: "INFO 2A",
      empresa: "DevSystems",
    },
    {
      matricula: "20231005",
      nome: "Pedro Lucas",
      turma: "QUIM 1B",
      empresa: "Química Forte",
    },
    {
      matricula: "20231006",
      nome: "Fernanda Souza",
      turma: "FLO 2A",
      empresa: "Madeira Verde",
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
    {
      label: "Empresa",
      chave: "empresa",
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
              <p>Alunos em Estágio</p>
            </div>

          </div>

        </div>

        <div className={styles.cards}>

          <Cards
            titulo="Total de alunos"
            valor="120"
          />

          <Cards
            titulo="Alunos em estágio"
            valor="42"
          />

        </div>

        <br />

        <Tabela
          colunas={colunas}
          dados={alunos}
        />

      </main>
    </div>
  );
}
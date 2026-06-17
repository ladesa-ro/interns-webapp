import { useState } from "react";
import styles from "./relatorioSegundoAno.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Cards from "../../components/global_Components/Cards";
import Tabela from "../../components/global_Components/Tabela";

export default function RelatorioSegundoAno() {
  const navigate = useNavigate();

  const [alunos] = useState([
    {
      matricula: "2025102020039",
      nome: "Ana Beatriz Souza",
      turma: "2º B Informática",
      status: "Não Realizado",
    },
    {
      matricula: "2025102020040",
      nome: "Lucas Pereira",
      turma: "2º B Química",
      status: "Não Realizado",
    },
    {
      matricula: "2025102020041",
      nome: "Marina Alvez",
      turma: "2º A Química",
      status: "Em Andamento",
    },
    {
      matricula: "2025102020042",
      nome: "Gabriel Martins",
      turma: "2º B Química",
      status: "Concluído",
    },
    {
      matricula: "2025102020043",
      nome: "Juliana Rodrigues",
      turma: "2º A Informática",
      status: "Concluído",
    },
    {
      matricula: "2025102020044",
      nome: "Rafael Gomes",
      turma: "2º B Química",
      status: "Em Andamento",
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
      label: "Status",
      chave: "status",
    },
  ];

  const concluidos = alunos.filter(
    (a) => a.status === "Concluído"
  ).length;

  const andamento = alunos.filter(
    (a) => a.status === "Em Andamento"
  ).length;

  const naoRealizado = alunos.filter(
    (a) => a.status === "Não Realizado"
  ).length;

  return (
    <div className={styles.layout}>
      <main className={styles.container}>
        <div className={styles.topo}>
          <div className={styles.tituloArea}>
            <button
              className={styles.voltar}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1>Painel CIEC</h1>
              <p>Relatório do 2º Ano</p>
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
            valor={concluidos}
            cor="green"
          />

          <Cards
            titulo="Em andamento"
            valor={andamento}
            cor="orange"
          />

          <Cards
            titulo="Não realizado"
            valor={naoRealizado}
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
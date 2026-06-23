import { useEffect, useState } from "react";
import styles from "./alunosSemEstagio.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Cards from "../../components/global_Components/Cards";
import Tabela from "../../components/global_Components/Tabela";

export default function AlunosSemEstagio() {
  const navigate = useNavigate();

  const [alunos, setAlunos] = useState([]);
  const [emAndamento, setEmAndamento] = useState(0);
  const [concluidos, setConcluidos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resEstagiarios, resEstagios] = await Promise.all([
          fetch(
            "https://dev.ladesa.com.br/api/v1/estagiarios?page=1&limit=1000"
          ),
          fetch(
            "https://dev.ladesa.com.br/api/v1/estagios?page=1&limit=1000"
          ),
        ]);

        const estagiariosJson = await resEstagiarios.json();
        const estagiosJson = await resEstagios.json();

        const estagios = estagiosJson.data || [];

        console.log(
          "STATUS ENCONTRADOS:",
          [...new Set(estagios.map((e) => e.status))]
        );

        const idsComEstagio = new Set(
          estagios.map((e) => e.estagiario?.id)
        );

        const qtdEmAndamento = estagios.filter(
          (e) => e.status === "EM_ANDAMENTO"
        ).length;

        const qtdConcluidos = estagios.filter(
          (e) => e.status === "ENCERRADO"
        ).length;

        setEmAndamento(qtdEmAndamento);
        setConcluidos(qtdConcluidos);

        const alunosSemEstagio = (estagiariosJson.data || [])
          .filter((aluno) => {
            const periodo = Number(aluno.periodo);

            return (
              periodo === 3 &&
              !idsComEstagio.has(aluno.id)
            );
          })
          .map((aluno) => ({
            matricula:
              aluno.perfil?.usuario?.matricula || "-",
            nome:
              aluno.perfil?.usuario?.nome || "-",
            turma:
              aluno.curso?.nomeAbreviado ||
              aluno.curso?.nome ||
              "-",
          }));

        setAlunos(alunosSemEstagio);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

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
            cor="red"
          />

          <Cards
            titulo="Em andamento"
            valor={emAndamento}
            cor="orange"
          />

          <Cards
            titulo="Estágios concluídos"
            valor={concluidos}
            cor="green"
          />
        </div>

        {loading ? (
          <p>Carregando...</p>
        ) : alunos.length > 0 ? (
          <Tabela
            colunas={colunas}
            dados={alunos}
          />
        ) : (
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            Nenhum aluno do 3º ano sem estágio encontrado.
          </div>
        )}
      </main>
    </div>
  );
}
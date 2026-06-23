import { useEffect, useState } from "react";
import styles from "./relatorioSegundoAno.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Cards from "../../components/global_Components/Cards";
import Tabela from "../../components/global_Components/Tabela";

export default function RelatorioSegundoAno() {
  const navigate = useNavigate();

  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [concluidos, setConcluidos] = useState(0);
  const [andamento, setAndamento] = useState(0);
  const [naoRealizado, setNaoRealizado] = useState(0);

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

        const estagiarios = estagiariosJson.data || [];
        const estagios = estagiosJson.data || [];

        const alunosSegundoAno = estagiarios.filter(
          (aluno) => Number(aluno.periodo) === 2
        );

        const dadosTabela = alunosSegundoAno.map((aluno) => {
          const estagio = estagios.find(
            (e) => e.estagiario?.id === aluno.id
          );

          let status = "Não Realizado";

          if (estagio?.status === "EM_ANDAMENTO") {
            status = "Em Andamento";
          }

          if (estagio?.status === "ENCERRADO") {
            status = "Concluído";
          }

          return {
            matricula:
              aluno.perfil?.usuario?.matricula || "-",
            nome:
              aluno.perfil?.usuario?.nome || "-",
            turma:
              aluno.curso?.nomeAbreviado ||
              aluno.curso?.nome ||
              "-",
            status,
          };
        });

        setAlunos(dadosTabela);

        setConcluidos(
          dadosTabela.filter(
            (a) => a.status === "Concluído"
          ).length
        );

        setAndamento(
          dadosTabela.filter(
            (a) => a.status === "Em Andamento"
          ).length
        );

        setNaoRealizado(
          dadosTabela.filter(
            (a) => a.status === "Não Realizado"
          ).length
        );
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
    {
      label: "Status",
      chave: "status",
    },
  ];

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

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <Tabela
            colunas={colunas}
            dados={alunos}
          />
        )}
      </main>
    </div>
  );
}
import { useEffect, useState } from "react";
import styles from "./alunos-em-estagio.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Tabela from "../../components/global_Components/Tabela";
import Cards from "../../components/global_Components/Cards";
import apiFetch from "../../utils/api";

export default function AlunosEmEstagio() {
  const navigate = useNavigate();

  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlunos() {
      setLoading(true);
      try {
        const response = await apiFetch("/estagios?page=1&limit=100");
        if (!response.ok) {
          throw new Error("Erro ao buscar estágios.");
        }
        const json = await response.json();

        const estagiosEmAndamento = (json.data || []).filter(
          (estagio) => estagio.status === "EM_ANDAMENTO"
        );

        const dadosTabela = estagiosEmAndamento.map((estagio) => ({
          id: estagio.id,
          matricula: estagio.estagiario?.matricula || "-",
          nome: estagio.estagiario?.nome || "-",
          turma:
            estagio.estagiario?.turma?.nome ||
            estagio.estagiario?.turma ||
            "-",
          empresa: estagio.empresa?.nome || "-",
        }));

        setAlunos(dadosTabela);
      } catch (error) {
        console.error("Erro ao carregar alunos em estágio:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlunos();
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
            titulo="Alunos em Estágio"
            valor={alunos.length}
            cor="green"
          />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>Carregando dados...</p>
        ) : alunos.length > 0 ? (
          <Tabela
            colunas={colunas}
            dados={alunos}
          />
        ) : (
          <div className={styles.semDados}>
            Não há alunos em estágio no momento.
          </div>
        )}
      </main>
    </div>
  );
}
import { useEffect, useState } from "react";
import styles from "./empresas.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Tabela from "../../components/global_Components/Tabela";
import Cards from "../../components/global_Components/Cards.jsx";
import apiFetch from "../../utils/api";

export default function Empresas() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmpresas() {
      setLoading(true);
      try {
        const response = await apiFetch("/empresas?page=1&limit=100");
        if (!response.ok) {
          throw new Error("Erro ao carregar empresas.");
        }
        const json = await response.json();
        setEmpresas(json.data || []);
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresas();
  }, []);

  const colunas = [
    {
      label: "Empresa",
      chave: "nomeFantasia",
    },
    {
      label: "CNPJ",
      chave: "cnpj",
    },
    {
      label: "Contato",
      chave: "email",
    },
  ];

  return (
    <div className={styles.layout}>
      <main className={styles.empresasContainer}>
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
              <p>Empresas Cadastradas</p>
            </div>
          </div>
        </div>

        <div className={styles.cards}>
          <Cards
            titulo="Quantidade de empresas"
            valor={empresas.length}
            cor="green"
          />

          <Cards
            titulo="Empresas com convênio ativo"
            valor={empresas.length} // Fallback dinâmico temporário
            cor="green"
          />
        </div>

        {loading ? (
          <p style={{ textAlign: "center", marginTop: "20px" }}>Carregando empresas...</p>
        ) : empresas.length > 0 ? (
          <Tabela
            colunas={colunas}
            dados={empresas}
          />
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
            Nenhuma empresa cadastrada.
          </div>
        )}
      </main>
    </div>
  );
}
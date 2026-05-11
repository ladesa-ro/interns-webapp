import { useEffect, useState } from "react";
import styles from "./empresas.module.css";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Tabela from "../../components/global_Components/Tabela";
import Cards from "../../components/global_Components/cards";

export default function Empresas() {
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    fetch("https://dev.ladesa.com.br/api/v1/empresas?page=1&limit=10")
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setEmpresas(json.data);
      })
      .catch((error) => console.log(error));
  }, []);

  {/*A lista do Fetch está vazia*/}
  
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
            valor="24"
            cor="green"
          />

          <Cards
            titulo="Empresas com estágio ativo"
            valor="24"
            cor="green"
          />
        </div>

        <Tabela
          colunas={colunas}
          dados={empresas}
        />
      </main>
    </div>
  );
}
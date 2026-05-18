import {
  ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Tabela from "../../components/global_Components/Tabela";
import Cards from "../../components/global_Components/Cards.jsx";

import styles from "./vaga.module.css";

import logoQuimica from "../../assets/imagems/quimica.png";
import logoinformtica from "../../assets/imagems/informatica.png";
import logofloresta from "../../assets/imagems/floresta.png";

export default function Vaga() {
  const navigate = useNavigate();

  const [filtroCurso, setFiltroCurso] = useState("");
  const [vagas, setVagas] = useState([]);

  useEffect(() => {
    buscarVagas();
  }, []);

  async function buscarVagas() {
    try {
      const response = await fetch(
        "https://dev.ladesa.com.br/api/v1/estagios?page=1&limit=10&search=null&sortBy="
      );

      const data = await response.json();

      console.log(data);

      const vagasFormatadas = data.data.map((item) => ({
        id: item.id,

        empresa: item.empresa?.nome || "Empresa não informada",

        curso:
          item.estagiario?.curso ||
          "Não informado",

        vagas: item.cargaHoraria,
      }));

      setVagas(vagasFormatadas);

    } catch (erro) {
      console.log("Erro ao buscar vagas:", erro);
    }
  }

  const vagasFiltradas = filtroCurso
    ? vagas.filter((vaga) => vaga.curso === filtroCurso)
    : vagas;

  const colunas = [
    {
      label: "Empresa",
      chave: "empresa",
    },
    {
      label: "Curso",
      chave: "curso",
    },
    {
      label: "Vagas",
      chave: "vagas",
    },
  ];

  return (
    <div className={styles.layout}>
      <main className={styles.vagaContainer}>

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
              <p>Vagas Disponíveis</p>
            </div>

          </div>
        </div>

        <div className={styles.cards}>

          <div onClick={() => setFiltroCurso("Informática")}>
            <Cards
              imagem={logoinformtica}
              titulo="Informática"
              valor="24"
            />
          </div>

          <div onClick={() => setFiltroCurso("Química")}>
            <Cards
              imagem={logoQuimica}
              titulo="Química"
              valor="24"
            />
          </div>

          <div onClick={() => setFiltroCurso("Floresta")}>
            <Cards
              imagem={logofloresta}
              titulo="Floresta"
              valor="24"
            />
          </div>

        </div>

        <br />

        <Tabela
          colunas={colunas}
          dados={vagasFiltradas}
        />

      </main>
    </div>
  );
} 0
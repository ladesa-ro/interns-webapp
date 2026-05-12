import {
  Building2,
  Briefcase,
  Users,
  AlertCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Tabela from "../../components/global_Components/Tabela";
import { useNavigate } from "react-router-dom";

import Cards from "../../components/global_Components/Cards.jsx";

import styles from "./vaga.module.css";
import logoQuimica from "../../assets/imagems/quimica.png"

import logoinformtica from "../../assets/imagems/informatica.png"

import logofloresta from "../../assets/imagems/floresta.png"

export default function Vaga() {
  const navigate = useNavigate();
  const vagas = [
    {
      id: 1,
      empresa: "Google",
      curso: "Informática",
      vagas: 20,
    },
    {
      id: 2,
      empresa: "Vale",
      curso: "Química",
      vagas: 1,
    },
    {
      id: 3,
      empresa: "Suzano",
      curso: "Floresta",
      vagas: 4,
    },
    {
      id: 4,
      empresa: "Microsoft",
      curso: "Informática",
      vagas: 12,
    },
    {
      id: 5,
      empresa: "Braskem",
      curso: "Química",
      vagas: 6,
    },
    {
      id: 6,
      empresa: "Klabin",
      curso: "Floresta",
      vagas: 3,
    },
    {
      id: 7,
      empresa: "Amazon",
      curso: "Informática",
      vagas: 8,
    },
    {
      id: 8,
      empresa: "Petrobras",
      curso: "Química",
      vagas: 5,
    },
    {
      id: 9,
      empresa: "Amaggi",
      curso: "Floresta",
      vagas: 2,
    },
    {
      id: 10,
      empresa: "Nubank",
      curso: "Informática",
      vagas: 7,
    },
  ];

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
          <Cards
            imagem={logoinformtica}
            titulo="informática"
            valor="24"

          />

          <Cards
            imagem={logoQuimica}
            titulo="Química"
            valor="24"
          />

          <Cards
            imagem={logofloresta}
            titulo={"Floresta"}
            valor={"24"}
          />
        </div>
        <br></br>

        <Tabela
          colunas={colunas}
          dados={vagas}
        />
      </main>
    </div>


  );
}

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
import { useState } from "react";
import Cards from "../../components/global_Components/Cards.jsx";

import styles from "./vaga.module.css";
import logoQuimica from "../../assets/imagems/quimica.png"

import logoinformtica from "../../assets/imagems/informatica.png"

import logofloresta from "../../assets/imagems/floresta.png"

export default function Vaga() {
  const navigate = useNavigate();
  const [filtroCurso, setFiltroCurso] = useState("");

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
        <br></br>

        <Tabela
          colunas={colunas}
          dados={vagasFiltradas} />
      </main>
    </div>


  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import TabelaVagas from "../../components/registerVaga_Components/TabelaVagas";
import Styles from "./cadastrarVaga.module.css";
import { Plus } from "lucide-react";

export default function CadastrarVaga() {
  const navigate = useNavigate();

  return (
    <div className={Styles.container}>
      <div className={Styles.topContainer}>
        <div>
          <h1>Cadastro de Vagas de Estágio</h1>
          <h3>Gerencie as vagas disponíveis para os alunos</h3>
        </div>

        <button
          className={Styles.botaoCadastrar}
          onClick={() => navigate("/vagas/nova")}
        >
          <div>
            <Plus size={20} />
            Nova Vaga
          </div>
        </button>
      </div>

      <TabelaVagas />
    </div>
  );
}
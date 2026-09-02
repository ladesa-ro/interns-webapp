import { useNavigate } from "react-router-dom";
import TabelaVagas from "../../components/registerVaga_Components/TabelaVagas";
import styles from "./cadastrarVaga.module.css";
import { Plus } from "lucide-react";
import { Button, PageHeader } from "../../components/ui";

export default function CadastrarVaga() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <PageHeader
        title="Cadastro de Vagas de Estágio"
        description="Gerencie as vagas disponíveis para os alunos"
        actions={
          <Button onClick={() => navigate("/vagas/nova")}>
            <Plus size={18} aria-hidden="true" />
            Nova Vaga
          </Button>
        }
      />

      <TabelaVagas />
    </div>
  );
}
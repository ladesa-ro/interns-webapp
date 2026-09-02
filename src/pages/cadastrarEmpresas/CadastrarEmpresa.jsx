import { useNavigate } from "react-router-dom";
import TabelaRegistros from '../../components/registerEmpresa_Components/TabelaRegistros';
import styles from './cadastrarEmpresa.module.css';
import { Plus } from 'lucide-react';
import { Button, PageHeader } from '../../components/ui';

export default function CadastrarEmpresa() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <PageHeader
        title="Cadastro de Empresas"
        description="Gerencie as empresas parceiras do IFRO"
        actions={
          <Button onClick={() => navigate("/nova-empresa")}>
            <Plus size={18} aria-hidden="true" />
            Nova Empresa
          </Button>
        }
      />

      <TabelaRegistros />
    </div>
  );
}
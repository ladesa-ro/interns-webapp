import React from 'react';
import { useNavigate } from "react-router-dom";
import TabelaRegistros from '../../components/registerEmpresa_Components/TabelaRegistros';
import Styles from '../cadastrarEmpresas/cadastrarEmpresa.module.css';
import { Plus } from 'lucide-react';

export default function CadastrarEmpresa() {

  const navigate = useNavigate();

  return (
    <div className={Styles.container}>
      <div className={Styles.topContainer}>
        <div>
          <h1>Cadastro de Empresas</h1>
          <h3>Gerencie as empresas parceiras do IFRO</h3>
        </div>

        <button
          className={Styles.botaoCadastrar}
          onClick={() => navigate("/nova-empresa")}
        >
          <div>
            <Plus />
            Nova Empresa
          </div>
        </button>
      </div>

      <TabelaRegistros />
    </div>
  );
}
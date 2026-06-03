import React from 'react';
import Styles from '../cadastrarEmpresas/cadastrarEmpresa.module.css';
import {Plus} from 'lucide-react';

export default function CadastrarEmpresa() {
  return (
    <div className={Styles.container}>
      <div className={Styles.topContainer}>
      <div>
      <h1>Cadastro de Empresas</h1>
      <h3>Gerencie as empresas parceiras do IFRO</h3>
      </div>
      <button className={Styles.botaoCadastrar}>
        <div><Plus/> Nova Empresa</div>
      </button>
    </div>
    </div>
  );
}

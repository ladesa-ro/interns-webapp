import React from 'react';
import Styles from '../../components/registerEmpresa_Components/cadastroEmpresaForm.module.css';
export default function CadastroEmpresaForm() {
  return (
     <div>
      <h2>Cadastrar Nova Empresa</h2>

      <form>
        <input placeholder="Matrícula" />
        <input placeholder="CNPJ" />

        <input placeholder="Razão Social" />
        <input placeholder="Nome Fantasia" />

        <input placeholder="Responsável" />
        <input placeholder="E-mail" />

        <input placeholder="Telefone" />
        <input placeholder="Endereço" />

        <input placeholder="Cidade" />
        <input placeholder="Estado" />

        <button type="submit">
          Cadastrar Empresa
        </button>
      </form>
    </div>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Styles from '../../components/registerEmpresa_Components/cadastroEmpresaForm.module.css';
export default function CadastroEmpresaForm() {

  const navigate = useNavigate();

  return (
     <div>
      {/*icone aqui*/}
      <h2>Cadastrar Nova Empresa</h2>

      <form>
        <input placeholder="Razão Social" />
        <input placeholder="Nome Fantasia" />

        <input placeholder="00.000.000/0000-00" />
        <input placeholder="E-mail" />
        <input placeholder="Telefone" />

        <input placeholder="Cidade" />
        <input placeholder="Estado" />

        <div className={Styles.botoes}>
          <button
            type="button"
            className={Styles.botaoCancelar}
            onClick={() => navigate('/cadastrarempresa')}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className={Styles.botaoCadastrar}
          >
            Cadastrar Empresa
          </button>
        </div>
      </form>
    </div>
  );
}
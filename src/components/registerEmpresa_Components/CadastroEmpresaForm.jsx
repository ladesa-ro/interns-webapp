import React from 'react';
import { useNavigate } from 'react-router-dom';
import Styles from './cadastroEmpresaForm.module.css';
import CadastrarEmpresaIcon from '../icons_Components/Icon_Cadastrar_Empresa_Comp';

export default function CadastroEmpresaForm() {

  const navigate = useNavigate();

  return (
    <div>
      <div className={Styles.title}>
        <CadastrarEmpresaIcon 
        className={Styles.icone}
        />      
        <h2>Cadastrar Nova Empresa</h2>
      </div>

    <div className={Styles.card}>


      <form className={Styles.form}>

        <div className={Styles.campo}>
          <label>Razão Social</label>
          <input
            type="text"
            placeholder="Razão Social"
          />
        </div>

        <div className={Styles.campo}>
          <label>Nome Fantasia</label>
          <input
            type="text"
            placeholder="Nome Fantasia"
          />
        </div>

        <div className={Styles.campo}>
          <label>CNPJ</label>
          <input
            type="text"
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div className={Styles.campo}>
          <label>E-mail</label>
          <input
            type="email"
            placeholder="Digite seu e-mail"
          />
        </div>

        <div className={Styles.campo}>
          <label>Telefone</label>
          <input
            type="text"
            placeholder="(00) 0000-0000"
          />
        </div>

        <div className={Styles.campo}>
          <label>Endereço</label>
          <input
            type="text"
            placeholder="Endereço"
          />
        </div>

        <div className={Styles.campo}>
          <label>Cidade</label>
          <input
            type="text"
            placeholder="Cidade"
          />
        </div>

        <div className={Styles.campo}>
          <label>Estado</label>
          <select>
            <option value="">Selecione</option>
            <option value="RO">Rondônia</option>
            <option value="AC">Acre</option>
            <option value="AM">Amazonas</option>
            <option value="MT">Mato Grosso</option>
          </select>
        </div>

      </form>

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
          Salvar Empresa
        </button>
      </div>

    </div>
    </div>
  );
}
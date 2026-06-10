import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Styles from './cadastroEmpresaForm.module.css';
import CadastrarEmpresaIcon from '../icons_Components/Icon_Cadastrar_Empresa_Comp';

export default function CadastroEmpresaForm({ modo }) {

  const navigate = useNavigate();
  const { id } = useParams();

  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {

    if (modo !== "editar") return;

    fetch(`https://dev.ladesa.com.br/api/v1/empresas/${id}`)
      .then((response) => response.json())
      .then((empresa) => {

        setRazaoSocial(empresa.razaoSocial || '');
        setNomeFantasia(empresa.nomeFantasia || '');
        setCnpj(empresa.cnpj || '');
        setEmail(empresa.email || '');
        setTelefone(empresa.telefone || '');

      })
      .catch((error) => {
        console.error(error);
      });

  }, [id, modo]);

  return (
    <div>

      <div className={Styles.title}>
        <CadastrarEmpresaIcon
          className={Styles.icone}
        />

        <h2>
          {modo === "editar"
            ? "Editar Empresa"
            : "Cadastrar Nova Empresa"}
        </h2>
      </div>

      <div className={Styles.card}>

        <form className={Styles.form}>

          <div className={Styles.campo}>
            <label>Razão Social</label>
            <input
              type="text"
              value={razaoSocial}
              onChange={(e) =>
                setRazaoSocial(e.target.value)
              }
            />
          </div>

          <div className={Styles.campo}>
            <label>Nome Fantasia</label>
            <input
              type="text"
              value={nomeFantasia}
              onChange={(e) =>
                setNomeFantasia(e.target.value)
              }
            />
          </div>

          <div className={Styles.campo}>
            <label>CNPJ</label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) =>
                setCnpj(e.target.value)
              }
            />
          </div>

          <div className={Styles.campo}>
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />
          </div>

          <div className={Styles.campo}>
            <label>Telefone</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) =>
                setTelefone(e.target.value)
              }
            />
          </div>

        </form>

        <div className={Styles.botoes}>

          <button
            type="button"
            className={Styles.botaoCancelar}
            onClick={() =>
              navigate('/cadastrarempresa')
            }
          >
            Cancelar
          </button>

          <button
            type="submit"
            className={Styles.botaoCadastrar}
          >
            {modo === "editar"
              ? "Salvar Alterações"
              : "Salvar Empresa"}
          </button>

        </div>

      </div>

    </div>
  );
}
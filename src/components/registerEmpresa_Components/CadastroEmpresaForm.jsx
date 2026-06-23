import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Styles from "./cadastroEmpresaForm.module.css";
import CadastrarEmpresaIcon from "../icons_Components/Icon_Cadastrar_Empresa_Comp";

export default function CadastroEmpresaForm({ modo }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // EMPRESA

  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // ENDEREÇO

  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");

  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  // EDITAR EMPRESA

  useEffect(() => {
    if (modo !== "editar") return;

    fetch(`https://dev.ladesa.com.br/api/v1/empresas/${id}`)
      .then((response) => response.json())

      .then((dados) => {
        setRazaoSocial(dados.razaoSocial || "");

        setNomeFantasia(dados.nomeFantasia || "");

        setCnpj(dados.cnpj || "");

        setEmail(dados.email || "");

        setTelefone(dados.telefone || "");
      });
  }, [id, modo]);

  // BUSCAR CEP

  const buscarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      const dados = await response.json();

      if (dados.erro) {
        alert("CEP não encontrado");

        return;
      }

      setLogradouro(dados.logradouro);

      setBairro(dados.bairro);

      setCidade(dados.localidade);

      setEstado(dados.uf);
    } catch (error) {
      console.error("Erro ViaCEP:", error);
    }
  };

  // SALVAR

  const salvarEmpresa = async (e) => {
    e.preventDefault();

    const endereco = {
      cep,

      logradouro,

      numero: Number(numero),

      bairro,

      complemento,

      pontoReferencia,

      cidade: {
        id: 1,
      },
    };

    console.log(endereco);

    try {
      const response = await fetch(
        "https://dev.ladesa.com.br/api/v1/enderecos",

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(endereco),
        },
      );

      const dados = await response.json();

      console.log("Endereço criado:", dados);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className={Styles.title}>
        <CadastrarEmpresaIcon className={Styles.icone} />

        <h2>
          {modo === "editar" ? "Editar Empresa" : "Cadastrar Nova Empresa"}
        </h2>
      </div>

      <div className={Styles.card}>
        <form className={Styles.form} onSubmit={salvarEmpresa}>
          <div className={Styles.campo}>
            <label>Razão Social</label>

            <input
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
            />
          </div>

          <div className={Styles.campo}>
            <label>Nome Fantasia</label>

            <input
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
            />
          </div>

          <div className={Styles.campo}>
            <label>CNPJ</label>

            <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
          </div>

          <div className={Styles.campo}>
            <label>E-mail</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={Styles.campo}>
            <label>Telefone</label>

            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>

          {/* ENDEREÇO */}

          <div className={Styles.campo}>
            <label>CEP</label>

            <input
              placeholder="76820-123"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              onBlur={buscarCep}
            />
          </div>

          <div className={Styles.campo}>
            <label>Logradouro</label>

            <input
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
            />
          </div>

          <div className={Styles.campo}>
            <label>Número</label>

            <input
              type="number"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </div>

          <div className={Styles.campo}>
            <label>Bairro</label>

            <input value={bairro} onChange={(e) => setBairro(e.target.value)} />
          </div>

          <div className={Styles.campo}>
            <label>Cidade</label>

            <input value={cidade} disabled />
          </div>

          <div className={Styles.campo}>
            <label>Estado</label>

            <input value={estado} disabled />
          </div>

          <div className={Styles.campo}>
            <label>Complemento</label>

            <input
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
          </div>

          <div className={Styles.campo}>
            <label>Ponto de Referência</label>

            <input
              value={pontoReferencia}
              onChange={(e) => setPontoReferencia(e.target.value)}
            />
          </div>
        </form>

        <div className={Styles.botoes}>
          <button
            className={Styles.botaoCancelar}
            onClick={() => navigate("/cadastrarempresa")}
          >
            Cancelar
          </button>

          <button className={Styles.botaoCadastrar} onClick={salvarEmpresa}>
            {modo === "editar" ? "Salvar Alterações" : "Salvar Empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}

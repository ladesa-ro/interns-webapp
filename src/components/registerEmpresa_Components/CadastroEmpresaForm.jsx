import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Styles from "./cadastroEmpresaForm.module.css";
import CadastrarEmpresaIcon from "../icons_Components/Icon_Cadastrar_Empresa_Comp";

export default function CadastroEmpresaForm() {
  const navigate = useNavigate();

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

  const [cidadeId, setCidadeId] = useState(null);
  const [cidadeNome, setCidadeNome] = useState("");
  const [estado, setEstado] = useState("");

  // BUSCA CEP
  async function buscarCep() {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await response.json();

      if (dados.erro) {
        alert("CEP inválido");
        return;
      }

      setLogradouro(dados.logradouro || "");
      setBairro(dados.bairro || "");
      setCidadeNome(dados.localidade);
      setEstado(dados.uf);

      // BUSCAR CIDADE NA API LADESA
      const cidadeResponse = await fetch(
        `https://dev.ladesa.com.br/api/v1/base/cidades?search=${encodeURIComponent(dados.localidade)}`
      );

      const cidadeDados = await cidadeResponse.json();

      // Valida por Nome E por Estado (UF) para evitar conflitos de cidades homônimas
      const cidadeEncontrada = cidadeDados.data?.find(
        (cidade) =>
          cidade.nome.trim().toLowerCase() === dados.localidade.trim().toLowerCase() &&
          cidade.estado?.sigla.toUpperCase() === dados.uf.toUpperCase()
      );

      if (!cidadeEncontrada) {
        alert("Cidade não encontrada na base do sistema.");
        setCidadeId(null);
        return;
      }

      console.log("Cidade encontrada:", cidadeEncontrada);
      setCidadeId(cidadeEncontrada.id);
    } catch (error) {
      console.error("Erro CEP:", error);
      alert("Erro ao buscar informações do CEP.");
    }
  }

  // SALVAR REGISTROS
  async function salvar(e) {
    e.preventDefault();

    if (!cidadeId) {
      alert("Por favor, digite um CEP válido e aguarde a validação da cidade antes de salvar.");
      return;
    }

    try {
      // 1 - CRIA ENDEREÇO
      const enderecoResponse = await fetch("https://dev.ladesa.com.br/api/v1/enderecos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cep,
          logradouro,
          numero: String(numero),
          bairro,
          complemento: complemento || null,
          pontoReferencia: pontoReferencia || null,
          cidade: {
            id: cidadeId,
          },
        }),
      });

      if (!enderecoResponse.ok) {
        const erroEnd = await enderecoResponse.json().catch(() => ({}));
        console.error("Erro detalhes endereço:", erroEnd);
        throw new Error("Erro ao criar endereço no servidor.");
      }

      const enderecoCriado = await enderecoResponse.json();
      console.log("Endereço criado com sucesso:", enderecoCriado);

      // Limpa os caracteres do CNPJ
      const cnpjApenasNumeros = cnpj.replace(/\D/g, "");

      // 2 - CRIA EMPRESA
      const empresaResponse = await fetch("https://dev.ladesa.com.br/api/v1/empresas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razaoSocial,
          nomeFantasia,
          cnpj: cnpjApenasNumeros,
          telefone,
          email,
          endereco: {
            id: enderecoCriado.id, 
          },
        }),
      });

      if (!empresaResponse.ok) {
        const dadosDoErro = await empresaResponse.json().catch(() => null);
        console.error("Detalhes do Erro da API Ladesa:", dadosDoErro);
        
        if (dadosDoErro && (dadosDoErro.message || dadosDoErro.mensagem)) {
          throw new Error(dadosDoErro.message || dadosDoErro.mensagem);
        }
        
        throw new Error("A API recusou o cadastro desta empresa. Verifique se o CNPJ ou E-mail já estão em uso.");
      }

      const empresaCriadaObjeto = await empresaResponse.json();
      console.log("EMPRESA CRIADA NO BANCO COM SUCESSO:", empresaCriadaObjeto);

      alert(`Empresa "${empresaCriadaObjeto.nomeFantasia || nomeFantasia}" cadastrada com sucesso!`);
      navigate("/cadastrarempresa");
    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao cadastrar empresa");
    }
  }

  return (
    <div>
      <div className={Styles.title}>
        <CadastrarEmpresaIcon className={Styles.icone} />
        <h2>Cadastrar Nova Empresa</h2>
      </div>

      <div className={Styles.card}>
        <form id="formCadastro" className={Styles.form} onSubmit={salvar}>
          <div className={Styles.campo}>
            <label>Razão Social</label>
            <input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>Nome Fantasia</label>
            <input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>CNPJ</label>
            <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>Telefone</label>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>CEP</label>
            <input value={cep} onChange={(e) => setCep(e.target.value)} onBlur={buscarCep} required />
          </div>

          <div className={Styles.campo}>
            <label>Logradouro</label>
            <input value={logradouro} onChange={(e) => setLogradouro(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>Número</label>
            <input value={numero} onChange={(e) => setNumero(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>Bairro</label>
            <input value={bairro} onChange={(e) => setBairro(e.target.value)} required />
          </div>

          <div className={Styles.campo}>
            <label>Cidade</label>
            <input value={cidadeNome} readOnly placeholder="Preenchido pelo CEP" />
          </div>

          <div className={Styles.campo}>
            <label>Estado</label>
            <input value={estado} readOnly placeholder="Preenchido pelo CEP" />
          </div>

          <div className={Styles.campo}>
            <label>Complemento</label>
            <input value={complemento} onChange={(e) => setComplemento(e.target.value)} />
          </div>

          <div className={Styles.campo}>
            <label>Ponto de Referência</label>
            <input value={pontoReferencia} onChange={(e) => setPontoReferencia(e.target.value)} />
          </div>
        </form>

        <div className={Styles.botoes}>
          <button
            type="button"
            className={Styles.botaoCancelar}
            onClick={() => navigate("/cadastrarempresa")}
          >
            Cancelar
          </button>

          <button type="submit" form="formCadastro" className={Styles.botaoCadastrar}>
            Salvar Empresa
          </button>
        </div>
      </div>
    </div>
  );
}
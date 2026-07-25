import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Styles from "./cadastroEmpresaForm.module.css";
import CadastrarEmpresaIcon from "../icons_Components/Icon_Cadastrar_Empresa_Comp";
import apiFetch from "../../utils/api";

export default function CadastroEmpresaForm() {
  const navigate = useNavigate();

  // Dados da empresa
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

  // SE MODO FOR EDITAR, CARREGA OS DADOS DA EMPRESA
  useEffect(() => {
    if (modo === "editar" && id) {
      async function carregarEmpresa() {
        try {
          const response = await apiFetch(`/empresas/${id}`);
          if (!response.ok) {
            throw new Error("Erro ao carregar dados da empresa.");
          }
          const empresa = await response.json();
          console.log("Empresa carregada:", empresa);

          setRazaoSocial(empresa.razaoSocial || "");
          setNomeFantasia(empresa.nomeFantasia || "");
          setCnpj(empresa.cnpj || "");
          setEmail(empresa.email || "");
          setTelefone(empresa.telefone || "");

          if (empresa.endereco) {
            setEnderecoId(empresa.endereco.id || null);
            setCep(empresa.endereco.cep || "");
            setLogradouro(empresa.endereco.logradouro || "");
            setNumero(empresa.endereco.numero || "");
            setBairro(empresa.endereco.bairro || "");
            setComplemento(empresa.endereco.complemento || "");
            setPontoReferencia(empresa.endereco.pontoReferencia || "");

            if (empresa.endereco.cidade) {
              setCidadeId(empresa.endereco.cidade.id || null);
              setCidadeNome(empresa.endereco.cidade.nome || "");
              if (empresa.endereco.cidade.estado) {
                setEstado(empresa.endereco.cidade.estado.sigla || "");
              }
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados para edição:", error);
          alert("Erro ao carregar dados da empresa. Verifique a conexão.");
        }
      }

      carregarEmpresa();
    }
  }, [modo, id]);

  // Estados de controle de UI
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(false); // loading ao salvar
  const [carregandoDados, setCarregandoDados] = useState(modo === "editar");
  const [toast, setToast] = useState(null); // { tipo: "sucesso"|"erro", mensagem: "" }

  // Exibe um toast que some automaticamente após 4 segundos
  function exibirToast(tipo, mensagem) {
    setToast({ tipo, mensagem });
    setTimeout(() => setToast(null), 4000);
  }

  // MODO EDITAR — carrega os dados existentes da empresa pelo :id
  useEffect(() => {
    if (modo !== "editar" || !id) return;

    const token = localStorage.getItem("token");

    fetch(`https://dev.ladesa.com.br/api/v1/empresas/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Empresa não encontrada.");
        return res.json();
      })
      .then((empresa) => {
        setRazaoSocial(empresa.razaoSocial || "");
        setNomeFantasia(empresa.nomeFantasia || "");
        setCnpj(formatarCnpj(empresa.cnpj || ""));
        setEmail(empresa.email || "");
        setTelefone(formatarTelefone(empresa.telefone || ""));

        const end = empresa.endereco;
        if (end) {
          setEnderecoId(end.id);
          setCep(end.cep || "");
          setLogradouro(end.logradouro || "");
          setNumero(end.numero || "");
          setBairro(end.bairro || "");
          setComplemento(end.complemento || "");
          setPontoReferencia(end.pontoReferencia || "");
          setCidadeId(end.cidade?.id || null);
          setCidadeNome(end.cidade?.nome || "");
          setEstado(end.cidade?.estado?.sigla || "");
        }
      })
      .catch((err) => {
        exibirToast("erro", err.message || "Erro ao carregar dados da empresa.");
      })
      .finally(() => setCarregandoDados(false));
  }, [modo, id]);

  // BUSCA CEP via ViaCEP + valida cidade na API Ladesa
  async function buscarCep() {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await response.json();

      if (dados.erro) {
        exibirToast("erro", "CEP inválido ou não encontrado.");
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

      const cidadeEncontrada = cidadeDados.data?.find(
        (cidade) =>
          cidade.nome.trim().toLowerCase() === dados.localidade.trim().toLowerCase() &&
          cidade.estado?.sigla.toUpperCase() === dados.uf.toUpperCase()
      );

      if (!cidadeEncontrada) {
        exibirToast("erro", "Cidade não encontrada na base do sistema.");
        setCidadeId(null);
        return;
      }

      setCidadeId(cidadeEncontrada.id);
    } catch (error) {
      exibirToast("erro", "Erro ao buscar informações do CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  // SALVAR REGISTROS
  async function salvar(e) {
    e.preventDefault(); // Evita o comportamento padrão do form

    if (!cidadeId) {
      exibirToast("erro", "Digite um CEP válido e aguarde a validação da cidade.");
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
          numero: String(numero), // Convertido para String baseado no GET da API
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

      // Garante que enviamos apenas os números do CNPJ para a API externa
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

      // TRATAMENTO DO ERRO 422: Captura o que a API Ladesa está rejeitando
      if (!empresaResponse.ok) {
        const dadosDoErro = await empresaResponse.json().catch(() => null);
        console.error("Detalhes do Erro 422 da API Ladesa:", dadosDoErro);

        // Se a API retornou um array/objeto de validações (comum em erros 422), tenta expor
        if (dadosDoErro && (dadosDoErro.message || dadosDoErro.mensagem)) {
          throw new Error(dadosDoErro.message || dadosDoErro.mensagem);
        }

        throw new Error("Erro de validação (422) ao criar a empresa. Verifique o console.");
      }

      alert("Empresa cadastrada com sucesso!");
      navigate("/cadastrarempresa");
    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao cadastrar empresa");
    }
  }

  return (
    <div>
      {/* Toast de feedback */}
      {toast && (
        <div className={`${Styles.toast} ${Styles[`toast--${toast.tipo}`]}`}>
          {toast.mensagem}
        </div>
      )}

      <div className={Styles.title}>
        <CadastrarEmpresaIcon className={Styles.icone} />
        <h2>{modo === "editar" ? "Editar Empresa" : "Cadastrar Nova Empresa"}</h2>
      </div>

      <div className={Styles.card}>
        <form id="formCadastro" className={Styles.form} onSubmit={salvar}>
          <div className={Styles.campo}>
            <label>Razão Social</label>
            <input
              value={razaoSocial}
              onChange={(e) => setRazaoSocial(e.target.value)}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>Nome Fantasia</label>
            <input
              value={nomeFantasia}
              onChange={(e) => setNomeFantasia(e.target.value)}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>CNPJ</label>
            <input
              value={cnpj}
              onChange={(e) => setCnpj(formatarCnpj(e.target.value))}
              placeholder="XX.XXX.XXX/XXXX-XX"
              maxLength={18}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>Telefone</label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              placeholder="(XX) XXXXX-XXXX"
              maxLength={15}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>CEP</label>
            <input
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              onBlur={buscarCep}
              placeholder="00000-000"
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>Logradouro</label>
            <input
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>Número</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>Bairro</label>
            <input
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              required
            />
          </div>

          <div className={Styles.campo}>
            <label>Cidade</label>
            <input
              value={buscandoCep ? "Buscando..." : cidadeNome}
              readOnly
              placeholder="Preenchido pelo CEP"
            />
          </div>

          <div className={Styles.campo}>
            <label>Estado</label>
            <input
              value={buscandoCep ? "..." : estado}
              readOnly
              placeholder="Preenchido pelo CEP"
            />
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
            type="button"
            className={Styles.botaoCancelar}
            onClick={() => navigate("/cadastrarempresa")}
            disabled={carregando}
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
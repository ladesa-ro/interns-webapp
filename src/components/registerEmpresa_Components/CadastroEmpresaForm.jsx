import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Styles from "./cadastroEmpresaForm.module.css";
import CadastrarEmpresaIcon from "../icons_Components/Icon_Cadastrar_Empresa_Comp";
import apiFetch from "../../utils/api";

// Formata CNPJ como XX.XXX.XXX/XXXX-XX enquanto o usuário digita
function formatarCnpj(valor) {
  const nums = valor.replace(/\D/g, "").slice(0, 14);
  return nums
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// Formata telefone como (XX) XXXXX-XXXX enquanto o usuário digita
function formatarTelefone(valor) {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 10) {
    return nums
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return nums
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

// Valida dígitos verificadores do CNPJ
function validarCnpj(cnpj) {
  const nums = cnpj.replace(/\D/g, "");
  if (nums.length !== 14) return false;
  if (/^(\d)\1+$/.test(nums)) return false;

  const calc = (n, pos) => {
    let soma = 0;
    let peso = pos;
    for (let i = 0; i < n; i++) {
      soma += parseInt(nums.charAt(i)) * peso--;
      if (peso < 2) peso = 9;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return (
    calc(12, 5) === parseInt(nums[12]) &&
    calc(13, 6) === parseInt(nums[13])
  );
}

export default function CadastroEmpresaForm({ modo }) {
  const navigate = useNavigate();
  const { id } = useParams(); // Lê o ID da empresa na rota /editar-empresa/:id

  // Dados da empresa
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Dados do endereço
  const [enderecoId, setEnderecoId] = useState(null); // ID do endereço existente (modo editar)
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [pontoReferencia, setPontoReferencia] = useState("");
  const [cidadeId, setCidadeId] = useState(null);
  const [cidadeNome, setCidadeNome] = useState("");
  const [estado, setEstado] = useState("");

  // Estados de controle de UI
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(modo === "editar");
  const [toast, setToast] = useState(null); // { tipo: "sucesso"|"erro", mensagem: "" }

  // Ref para controlar se os dados do endereço já foram carregados (modo editar)
  // Impede que o onBlur do CEP sobrescreva os dados vindos da API
  const dadosEnderecoCarregados = useRef(false);

  // Exibe um toast que some automaticamente após 4 segundos
  function exibirToast(tipo, mensagem) {
    setToast({ tipo, mensagem });
    setTimeout(() => setToast(null), 4000);
  }

  // MODO EDITAR — carrega os dados existentes da empresa pelo :id
  useEffect(() => {
    if (modo !== "editar" || !id) return;

    dadosEnderecoCarregados.current = false;

    apiFetch(`/empresas/${id}`)
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
          // Formata o CEP como XXXXX-XXX para exibição
          const cepFormatado = (end.cep || "").replace(/^(\d{5})(\d{3})$/, "$1-$2");
          setCep(cepFormatado);
          setLogradouro(end.logradouro || "");
          setNumero(end.numero || "");
          setBairro(end.bairro || "");
          setComplemento(end.complemento || "");
          setPontoReferencia(end.pontoReferencia || "");
          setCidadeId(end.cidade?.id || null);
          setCidadeNome(end.cidade?.nome || "");
          setEstado(end.cidade?.estado?.sigla || "");
          // Marca que os dados do endereço já foram carregados
          dadosEnderecoCarregados.current = true;
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

    // Se estamos em modo editar e os dados já foram carregados da API,
    // só busca o CEP novamente se o usuário realmente modificou o campo
    if (modo === "editar" && dadosEnderecoCarregados.current && cidadeId) {
      return;
    }

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

      const cidadeResponse = await apiFetch(
        `/base/cidades?search=${encodeURIComponent(dados.localidade)}`
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
    } catch {
      exibirToast("erro", "Erro ao buscar informações do CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  // SALVAR — cria (POST) ou atualiza (PUT) empresa + endereço
  async function salvar(e) {
    e.preventDefault();

    if (!validarCnpj(cnpj)) {
      exibirToast("erro", "CNPJ inválido. Verifique os dígitos digitados.");
      return;
    }

    if (!cidadeId) {
      exibirToast("erro", "Digite um CEP válido e aguarde a validação da cidade.");
      return;
    }

    const cnpjApenasNumeros = cnpj.replace(/\D/g, "");
    const telefoneApenasNumeros = telefone.replace(/\D/g, "");

    setCarregando(true);

    try {
      // 1. Cria o novo registro de endereço (evita o bug de validação em PATCH /enderecos/:id da API Ladesa)
      const enderecoRes = await apiFetch("/enderecos", {
        method: "POST",
        body: JSON.stringify({
          cep: cep.replace(/\D/g, ""),
          logradouro,
          numero: String(numero),
          bairro,
          complemento: complemento || null,
          pontoReferencia: pontoReferencia || null,
          cidade: { id: Number(cidadeId) },
        }),
      });

      if (!enderecoRes.ok) {
        const err = await enderecoRes.json().catch(() => ({}));
        throw new Error(
          Array.isArray(err.details)
            ? err.details.map((d) => `${d.field}: ${d.message}`).join(" | ")
            : err.message || "Erro ao salvar endereço."
        );
      }

      const enderecoCriado = await enderecoRes.json();

      if (modo === "editar") {
        // 2. Atualiza a empresa vinculando o novo endereço
        const empresaRes = await apiFetch(`/empresas/${id}`, {
          method: "PATCH",
          body: JSON.stringify({
            razaoSocial,
            nomeFantasia,
            cnpj: cnpjApenasNumeros,
            telefone: telefoneApenasNumeros,
            email,
            endereco: { id: enderecoCriado.id },
          }),
        });

        if (!empresaRes.ok) {
          const err = await empresaRes.json().catch(() => ({}));
          // Rollback do endereço recém criado se falhar a atualização da empresa
          apiFetch(`/enderecos/${enderecoCriado.id}`, { method: "DELETE" }).catch(() => {});
          throw new Error(
            Array.isArray(err.details)
              ? err.details.map((d) => `${d.field}: ${d.message}`).join(" | ")
              : err.message || "Erro ao atualizar empresa."
          );
        }

        // 3. Remove silenciosamente o endereço antigo
        if (enderecoId && enderecoId !== enderecoCriado.id) {
          apiFetch(`/enderecos/${enderecoId}`, { method: "DELETE" }).catch(() => {});
        }

        exibirToast("sucesso", "Empresa atualizada com sucesso!");
        setTimeout(() => navigate("/cadastrarempresa"), 1500);
      } else {
        // Modo Cadastro
        const empresaRes = await apiFetch("/empresas", {
          method: "POST",
          body: JSON.stringify({
            razaoSocial,
            nomeFantasia,
            cnpj: cnpjApenasNumeros,
            telefone: telefoneApenasNumeros,
            email,
            endereco: { id: enderecoCriado.id },
          }),
        });

        if (!empresaRes.ok) {
          const err = await empresaRes.json().catch(() => ({}));
          // Rollback do endereço órfão
          apiFetch(`/enderecos/${enderecoCriado.id}`, { method: "DELETE" }).catch(() => {});
          throw new Error(err.message || "Erro ao cadastrar empresa.");
        }

        exibirToast("sucesso", "Empresa cadastrada com sucesso!");
        setTimeout(() => navigate("/cadastrarempresa"), 1500);
      }
    } catch (error) {
      exibirToast("erro", error.message || "Erro inesperado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) {
    return (
      <div className={Styles.loadingContainer}>
        <p>Carregando dados da empresa...</p>
      </div>
    );
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
              onChange={(e) => {
                setCep(e.target.value);
                // Ao editar o CEP manualmente, libera nova busca
                dadosEnderecoCarregados.current = false;
              }}
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

          <button
            type="submit"
            form="formCadastro"
            className={Styles.botaoCadastrar}
            disabled={carregando || buscandoCep}
          >
            {carregando
              ? modo === "editar"
                ? "Salvando..."
                : "Cadastrando..."
              : modo === "editar"
              ? "Salvar Alterações"
              : "Salvar Empresa"}
          </button>
        </div>
      </div>
    </div>
  );
}
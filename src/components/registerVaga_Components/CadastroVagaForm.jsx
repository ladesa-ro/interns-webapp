import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Styles from "./cadastroVagaForm.module.css";
import CadastrarVagaIcon from "../icons_Components/Icon_Cadastrar_Vaga_Comp";
import apiFetch from "../../utils/api";

export default function CadastroVagaForm({ modo = "novo" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados dos campos do formulário
  const [codigo, setCodigo] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [areaId, setAreaId] = useState("");
  const [numeroVagas, setNumeroVagas] = useState(1);
  const [status, setStatus] = useState("DISPONIVEL");

  // Estados para dados auxiliares e UX
  const [empresas, setEmpresas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);

  // Carrega lista de empresas e cursos para preencher os selects
  useEffect(() => {
    async function carregarAuxiliares() {
      try {
        const [responseEmpresas, responseCursos] = await Promise.all([
          apiFetch("/empresas?page=1&limit=1000"),
          apiFetch("/cursos?page=1&limit=1000"),
        ]);

        if (responseEmpresas.ok && responseCursos.ok) {
          const dataEmpresas = await responseEmpresas.json();
          const dataCursos = await responseCursos.json();
          setEmpresas(dataEmpresas.data || []);
          setCursos(dataCursos.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados auxiliares (empresas/cursos):", error);
      }
    }
    carregarAuxiliares();
  }, []);

  // Se modo for EDITAR, carrega os dados da vaga selecionada
  useEffect(() => {
    if (modo === "editar" && id) {
      async function carregarVaga() {
        setCarregandoDados(true);
        try {
          const response = await apiFetch(`/estagios/${id}`);
          if (!response.ok) {
            throw new Error("Erro ao carregar dados da vaga.");
          }
          const vaga = await response.json();
          console.log("Vaga carregada para edição:", vaga);

          // Preenche os campos do formulário
          setCodigo(vaga.tipoAditivo || vaga.codigo || "");
          setTitulo(vaga.nomeSupervisor || vaga.titulo || "");
          setDescricao(vaga.descricao || "");
          setEmpresaId(vaga.empresa?.id || "");
          setAreaId(vaga.CursoReferencia?.id || "");
          setNumeroVagas(vaga.cargaHoraria || vaga.numeroVagas || 1);
          setStatus(vaga.status || "DISPONIVEL");
        } catch (error) {
          console.error("Erro ao carregar vaga para edição:", error);
          alert("Erro ao carregar dados da vaga. Verifique a conexão.");
        } finally {
          setCarregandoDados(false);
        }
      }

      carregarVaga();
    }
  }, [modo, id]);

  // Função para salvar registros (criação ou edição)
  async function salvar(e) {
    e.preventDefault();

    // Validações básicas de campos obrigatórios
    if (!codigo.trim()) {
      alert("Por favor, preencha o código da vaga.");
      return;
    }
    if (!empresaId) {
      alert("Por favor, selecione uma empresa.");
      return;
    }
    if (!titulo.trim()) {
      alert("Por favor, preencha o título da vaga.");
      return;
    }
    if (!descricao.trim()) {
      alert("Por favor, preencha a descrição das atividades.");
      return;
    }
    if (!areaId) {
      alert("Por favor, selecione uma área.");
      return;
    }
    if (numeroVagas <= 0) {
      alert("O número de vagas deve ser no mínimo 1.");
      return;
    }

    setSubmetendo(true);

    try {
      // Constrói o corpo da requisição compatível com o DTO do backend
      const vagaBody = {
        cargaHoraria: Number(numeroVagas),
        status: status, // DISPONIVEL, EM_ANDAMENTO, ENCERRADO
        aditivo: false,
        horariosEstagio: [],
        empresa: {
          id: empresaId,
        },
        CursoReferencia: {
          id: areaId,
        },
        // Mapeamentos nos campos textuais livres para evitar perda de dados
        tipoAditivo: codigo.trim(),
        nomeSupervisor: titulo.trim(),
        // Envia campos customizados adicionais se o backend aceitar
        codigo: codigo.trim(),
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        numeroVagas: Number(numeroVagas)
      };

      let response;
      if (modo === "editar") {
        response = await apiFetch(`/estagios/${id}`, {
          method: "PATCH", // A especificação diz PUT ou PATCH, o Swagger indicou PATCH
          body: JSON.stringify(vagaBody),
        });
      } else {
        response = await apiFetch("/estagios", {
          method: "POST",
          body: JSON.stringify(vagaBody),
        });
      }

      if (!response.ok) {
        const dadosDoErro = await response.json().catch(() => null);
        console.error("Detalhes do Erro da API Ladesa:", dadosDoErro);
        throw new Error(
          dadosDoErro?.message || 
          dadosDoErro?.mensagem || 
          "A API recusou a operação com esta vaga."
        );
      }

      alert(
        modo === "editar"
          ? `Vaga "${titulo}" atualizada com sucesso!`
          : `Vaga "${titulo}" cadastrada com sucesso!`
      );

      navigate("/vagas");
    } catch (error) {
      console.error(error);
      alert(error.message || "Erro ao salvar vaga.");
    } finally {
      setSubmetendo(false);
    }
  }

  if (carregandoDados) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Carregando dados da vaga...</p>;
  }

  return (
    <div>
      <div className={Styles.title}>
        <CadastrarVagaIcon className={Styles.icone} size={28} />
        <h2>{modo === "editar" ? "Editar Vaga Cadastrada" : "Cadastrar Nova Vaga"}</h2>
      </div>

      <div className={Styles.card}>
        <form id="formCadastroVaga" className={Styles.form} onSubmit={salvar}>
          
          <div className={Styles.campo}>
            <label>Código da vaga</label>
            <input 
              value={codigo} 
              onChange={(e) => setCodigo(e.target.value)} 
              placeholder="Ex: VA0001"
              required 
            />
          </div>

          <div className={Styles.campo}>
            <label>Empresa</label>
            <select 
              value={empresaId} 
              onChange={(e) => setEmpresaId(e.target.value)} 
              required
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nomeFantasia || emp.razaoSocial}
                </option>
              ))}
            </select>
          </div>

          <div className={`${Styles.campo} ${Styles.fullWidth}`}>
            <label>Título da vaga</label>
            <input 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              placeholder="Ex: Desenvolvedor Web Jr"
              required 
            />
          </div>

          <div className={`${Styles.campo} ${Styles.fullWidth}`}>
            <label>Descrição das atividades</label>
            <textarea 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              placeholder="Descreva detalhadamente as atividades a serem desempenhadas..."
              rows={4}
              required 
            />
          </div>

          <div className={Styles.campo}>
            <label>Área</label>
            <select 
              value={areaId} 
              onChange={(e) => setAreaId(e.target.value)} 
              required
            >
              <option value="">Selecione uma área</option>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomeAbreviado || c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={Styles.campo}>
            <label>Número de vagas</label>
            <input 
              type="number" 
              value={numeroVagas} 
              onChange={(e) => setNumeroVagas(parseInt(e.target.value) || "")} 
              min="1"
              required 
            />
          </div>

          <div className={Styles.campo}>
            <label>Status da vaga</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              required
            >
              <option value="DISPONIVEL">Aberta</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="ENCERRADO">Fechada</option>
            </select>
          </div>

        </form>

        <div className={Styles.botoes}>
          <button
            type="button"
            className={Styles.botaoCancelar}
            onClick={() => navigate("/vagas")}
            disabled={submetendo}
          >
            Cancelar
          </button>

          <button 
            type="submit" 
            form="formCadastroVaga" 
            className={Styles.botaoCadastrar}
            disabled={submetendo}
          >
            {submetendo ? "Salvando..." : modo === "editar" ? "Salvar Alterações" : "Salvar Vaga"}
          </button>
        </div>
      </div>
    </div>
  );
}

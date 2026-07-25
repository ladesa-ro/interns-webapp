import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Styles from "./cadastroVagaForm.module.css";
import CadastrarVagaIcon from "../icons_Components/Icon_Cadastrar_Vaga_Comp";
import apiFetch from "../../utils/api";

export default function CadastroVagaForm({ modo = "novo" }) {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados dos campos do formulário para a API /estagios
  const [campusId, setCampusId] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [areaId, setAreaId] = useState(""); // CursoReferencia
  const [cargaHoraria, setCargaHoraria] = useState(1);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("DISPONIVEL");
  const [nomeSupervisor, setNomeSupervisor] = useState("");
  const [emailSupervisor, setEmailSupervisor] = useState("");
  const [telefoneSupervisor, setTelefoneSupervisor] = useState("");
  const [aditivo, setAditivo] = useState(false);
  const [tipoAditivo, setTipoAditivo] = useState("");
  const [horariosEstagio, setHorariosEstagio] = useState([]);

  // Estados para dados auxiliares e UX
  const [campi, setCampi] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);

  const diasDaSemana = [
    { valor: 0, label: "Domingo" },
    { valor: 1, label: "Segunda-feira" },
    { valor: 2, label: "Terça-feira" },
    { valor: 3, label: "Quarta-feira" },
    { valor: 4, label: "Quinta-feira" },
    { valor: 5, label: "Sexta-feira" },
    { valor: 6, label: "Sábado" },
  ];

  // Carrega lista de campi, empresas e cursos para preencher os selects
  useEffect(() => {
    async function carregarAuxiliares() {
      try {
        const [responseCampi, responseEmpresas, responseCursos] = await Promise.all([
          apiFetch("/campi?page=1&limit=1000"),
          apiFetch("/empresas?page=1&limit=1000"),
          apiFetch("/cursos?page=1&limit=1000"),
        ]);

        if (responseCampi.ok && responseEmpresas.ok && responseCursos.ok) {
          const dataCampi = await responseCampi.json();
          const dataEmpresas = await responseEmpresas.json();
          const dataCursos = await responseCursos.json();
          setCampi(dataCampi.data || []);
          setEmpresas(dataEmpresas.data || []);
          setCursos(dataCursos.data || []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados auxiliares (campi/empresas/cursos):", error);
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
          setCampusId(vaga.campus?.id || "");
          setEmpresaId(vaga.empresa?.id || "");
          setAreaId(vaga.CursoReferencia?.id || "");
          setCargaHoraria(vaga.cargaHoraria || 1);
          
          // Formatar data YYYY-MM-DD para o input HTML5
          const formatarData = (d) => {
            if (!d) return "";
            return d.split("T")[0];
          };
          setDataInicio(formatarData(vaga.dataInicio));
          setDataFim(formatarData(vaga.dataFim));
          
          setStatus(vaga.status || "DISPONIVEL");
          setNomeSupervisor(vaga.nomeSupervisor || "");
          setEmailSupervisor(vaga.emailSupervisor || "");
          setTelefoneSupervisor(vaga.telefoneSupervisor || "");
          setAditivo(!!vaga.aditivo);
          setTipoAditivo(vaga.tipoAditivo || "");
          
          // Mapeia horários existentes
          const horariosMapeados = (vaga.horariosEstagio || []).map((h) => ({
            diaSemana: typeof h.diaSemana === "number" ? h.diaSemana : 0,
            horaInicio: h.horaInicio || "",
            horaFim: h.horaFim || ""
          }));
          setHorariosEstagio(horariosMapeados);
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

  // Manipulação dinâmica de horários
  const adicionarHorario = () => {
    setHorariosEstagio([
      ...horariosEstagio,
      { diaSemana: 1, horaInicio: "08:00", horaFim: "12:00" },
    ]);
  };

  const removerHorario = (index) => {
    setHorariosEstagio(horariosEstagio.filter((_, i) => i !== index));
  };

  const atualizarHorario = (index, campo, valor) => {
    const novosHorarios = [...horariosEstagio];
    novosHorarios[index][campo] = campo === "diaSemana" ? Number(valor) : valor;
    setHorariosEstagio(novosHorarios);
  };

  // Função para salvar registros (criação ou edição)
  async function salvar(e) {
    e.preventDefault();

    // Validações básicas de campos obrigatórios
    if (!campusId) {
      alert("Por favor, selecione um campus.");
      return;
    }
    if (!empresaId) {
      alert("Por favor, selecione uma empresa.");
      return;
    }
    if (!areaId) {
      alert("Por favor, selecione um curso (área).");
      return;
    }
    if (cargaHoraria <= 0) {
      alert("A carga horária deve ser no mínimo 1.");
      return;
    }

    setSubmetendo(true);

    try {
      // Constrói o corpo da requisição compatível com o DTO do backend
      const vagaBody = {
        campus: {
          id: campusId,
        },
        empresa: {
          id: empresaId,
        },
        estagiario: null,
        usuarioOrientador: null,
        cargaHoraria: Number(cargaHoraria),
        CursoReferencia: {
          id: areaId,
        },
        dataInicio: dataInicio || null,
        dataFim: dataFim || null,
        status: status,
        nomeSupervisor: nomeSupervisor || null,
        emailSupervisor: emailSupervisor || null,
        telefoneSupervisor: telefoneSupervisor || null,
        aditivo: Boolean(aditivo),
        tipoAditivo: aditivo ? tipoAditivo || null : null,
        horariosEstagio: horariosEstagio.map((h) => {
          let inicio = h.horaInicio;
          let fim = h.horaFim;
          if (inicio && inicio.length === 5) inicio += ":00";
          if (fim && fim.length === 5) fim += ":00";
          return {
            diaSemana: Number(h.diaSemana),
            horaInicio: inicio,
            horaFim: fim,
          };
        }),
      };

      let response;
      if (modo === "editar") {
        response = await apiFetch(`/estagios/${id}`, {
          method: "PATCH",
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
          "A API recusou a operação com esta vaga de estágio."
        );
      }

      alert(
        modo === "editar"
          ? "Vaga atualizada com sucesso!"
          : "Vaga cadastrada com sucesso!"
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
            <label>Campus</label>
            <select 
              value={campusId} 
              onChange={(e) => setCampusId(e.target.value)} 
              required
            >
              <option value="">Selecione um campus</option>
              {campi.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nomeFantasia || c.razaoSocial}
                </option>
              ))}
            </select>
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

          <div className={Styles.campo}>
            <label>Curso de Referência (Área)</label>
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
            <label>Carga Horária (horas)</label>
            <input 
              type="number" 
              value={cargaHoraria} 
              onChange={(e) => setCargaHoraria(parseInt(e.target.value) || "")} 
              min="1"
              required 
            />
          </div>

          <div className={Styles.campo}>
            <label>Data de Início</label>
            <input 
              type="date"
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
            />
          </div>

          <div className={Styles.campo}>
            <label>Data de Fim</label>
            <input 
              type="date"
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
            />
          </div>

          <div className={Styles.campo}>
            <label>Nome do Supervisor</label>
            <input 
              value={nomeSupervisor} 
              onChange={(e) => setNomeSupervisor(e.target.value)} 
              placeholder="Ex: Dr. João da Silva"
            />
          </div>

          <div className={Styles.campo}>
            <label>E-mail do Supervisor</label>
            <input 
              type="email"
              value={emailSupervisor} 
              onChange={(e) => setEmailSupervisor(e.target.value)} 
              placeholder="Ex: supervisor@empresa.com"
            />
          </div>

          <div className={Styles.campo}>
            <label>Telefone do Supervisor</label>
            <input 
              value={telefoneSupervisor} 
              onChange={(e) => setTelefoneSupervisor(e.target.value)} 
              placeholder="Ex: (69) 99999-9999"
            />
          </div>

          <div className={Styles.campo}>
            <label>Status da Vaga</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)} 
              required
            >
              <option value="DISPONIVEL">Aberta (Disponível)</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="ENCERRADO">Fechada</option>
            </select>
          </div>

          <div className={Styles.campo} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", marginTop: "25px" }}>
            <input 
              type="checkbox" 
              id="aditivo" 
              checked={aditivo} 
              onChange={(e) => setAditivo(e.target.checked)} 
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <label htmlFor="aditivo" style={{ margin: 0, cursor: "pointer" }}>Esta vaga possui Aditivo?</label>
          </div>

          <div className={Styles.campo}>
            <label>Tipo do Aditivo</label>
            <input 
              value={tipoAditivo} 
              onChange={(e) => setTipoAditivo(e.target.value)} 
              placeholder="Ex: Termo de Prorrogação"
              disabled={!aditivo}
              required={aditivo}
            />
          </div>

          {/* Horários Dinâmicos */}
          <div className={Styles.fullWidth} style={{ borderTop: "1px solid #eee", paddingTop: "1.5rem", marginTop: "1rem" }}>
            <h3 style={{ color: "#066436", fontSize: "16px", marginBottom: "1rem" }}>Horários de Estágio</h3>
            
            {horariosEstagio.length === 0 ? (
              <p style={{ color: "#777", fontSize: "0.9rem", marginBottom: "1rem" }}>Nenhum horário cadastrado para esta vaga.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "1rem" }}>
                {horariosEstagio.map((horario, index) => (
                  <div key={index} style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap", background: "#f9f9f9", padding: "10px", borderRadius: "8px", border: "1px solid #eee" }}>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: "150px" }}>
                      <label style={{ fontSize: "0.8rem", color: "#666", marginBottom: "4px" }}>Dia da Semana</label>
                      <select
                        value={horario.diaSemana}
                        onChange={(e) => atualizarHorario(index, "diaSemana", e.target.value)}
                        style={{ padding: "0.5rem", border: "1px solid #D0D5DD", borderRadius: "0.375rem" }}
                      >
                        {diasDaSemana.map((d) => (
                          <option key={d.valor} value={d.valor}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={{ fontSize: "0.8rem", color: "#666", marginBottom: "4px" }}>Hora Início</label>
                      <input
                        type="time"
                        value={horario.horaInicio.substring(0, 5)}
                        onChange={(e) => atualizarHorario(index, "horaInicio", e.target.value)}
                        style={{ padding: "0.5rem", border: "1px solid #D0D5DD", borderRadius: "0.375rem" }}
                        required
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={{ fontSize: "0.8rem", color: "#666", marginBottom: "4px" }}>Hora Fim</label>
                      <input
                        type="time"
                        value={horario.horaFim.substring(0, 5)}
                        onChange={(e) => atualizarHorario(index, "horaFim", e.target.value)}
                        style={{ padding: "0.5rem", border: "1px solid #D0D5DD", borderRadius: "0.375rem" }}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removerHorario(index)}
                      style={{
                        background: "#E7040E",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        alignSelf: "flex-end",
                        height: "38px",
                        fontSize: "0.85rem",
                        fontWeight: 500
                      }}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={adicionarHorario}
              style={{
                background: "#016630",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500
              }}
            >
              + Adicionar Horário
            </button>
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

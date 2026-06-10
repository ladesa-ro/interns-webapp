import { useState } from "react";
import { Building2, School } from "lucide-react";
import "./SolicitarEstagio.css";

export default function SolicitarEstagio() {
  const [tipo, setTipo] = useState("externo");

  return (
    <div className="solicitacao-container">
      <div className="conteudo-centralizado">
        <div className="tipo-estagio">
          <button
            className={`tipo-card ${tipo === "interno" ? "ativo" : ""
              }`}
            onClick={() => setTipo("interno")}
            type="button"
          >
            <School size={30} />
            <span>Estágio interno</span>
          </button>

          <button
            className={`tipo-card ${tipo === "externo" ? "ativo" : ""
              }`}
            onClick={() => setTipo("externo")}
            type="button"
          >
            <Building2 size={30} />
            <span>Estágio externo</span>
          </button>
        </div>

        <form className="form-estagio">
          {tipo === "externo" ? (
            <>
              <label>Nome da Empresa:</label>
              <input
                type="text"
                placeholder="Digite o nome da empresa"
              />

              <label>CNPJ:</label>
              <input
                type="text"
                placeholder="Digite o CNPJ da empresa"
              />

              <label>Email:</label>
              <input
                type="email"
                placeholder="Digite o email da empresa"
              />

              <label>Telefone:</label>
              <input
                type="text"
                placeholder="Digite o telefone"
              />

              <label>Supervisor:</label>
              <input
                type="text"
                placeholder="Nome do supervisor"
              />
            </>
          ) : (
            <>
              <label>Setor:</label>
              <input
                type="text"
                placeholder="Informe o setor"
              />

              <label>Responsável:</label>
              <input
                type="text"
                placeholder="Nome do responsável"
              />

              <label>Horário:</label>
              <input
                type="text"
                placeholder="Ex: 13:00 às 17:00"
              />

              <label>Observações:</label>
              <input
                type="text"
                placeholder="Observações"
              />
            </>
          )}

          <button type="submit" className="btn-enviar">
            Solicitar Estágio
          </button>
        </form>
      </div>
    </div>
  );
}
import { GraduationCap, ClipboardCheck } from "lucide-react";
import "./Inicio.css";

export default function Inicio() {
  return (
    <div className="inicio-container">
      <section>
        <h2>Solicitação de estágio</h2>

        <div className="cards-area">
          <div className="inicio-card">
            <GraduationCap size={42} />

            <span>Solicitar Estágio</span>
          </div>
        </div>
      </section>

      <hr />

      <section>
        <h2>Assinar folha de ponto</h2>

        <div className="cards-area">
          <div className="inicio-card">
            <ClipboardCheck size={42} />

            <span>
              Registrar
              <br />
              frequência
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
import styles from "./RegistroPontoCard.module.css";
import { Badge, Button } from "../ui";
import {
  ROTULOS_STATUS,
  TONS_STATUS,
  formatarData,
  formatarHorario,
  formatarQuantidadeHoras,
} from "../../utils/folhaPontoApi";

export default function RegistroPontoCard({ folha, onCancelar, cancelavel = false }) {
  const rotuloStatus = ROTULOS_STATUS.get(folha.status) ?? folha.status;
  const dataFormatada = formatarData(folha.data);

  return (
    <article className={styles.card}>
      <div className={styles.dados}>
        <div className={styles.coluna}>
          <span className={styles.rotulo}>Data</span>
          <span className={styles.valor}>{dataFormatada}</span>
        </div>

        <div className={styles.coluna}>
          <span className={styles.rotulo}>Horário</span>
          <span className={styles.valor}>
            {formatarHorario(folha.horaInicio, folha.horaFim)}
          </span>
        </div>

        <div className={styles.coluna}>
          <span className={styles.rotulo}>Horas</span>
          <span className={styles.valor}>
            {formatarQuantidadeHoras(folha.quantidadeHoras)}
          </span>
        </div>

        <div className={styles.coluna}>
          <span className={styles.rotulo}>Situação</span>
          <Badge tone={TONS_STATUS.get(folha.status) ?? "neutral"}>{rotuloStatus}</Badge>
        </div>
      </div>

      {folha.observacoes ? (
        <div className={styles.observacoes}>
          <span className={styles.rotulo}>Observações</span>
          <p className={styles.textoObservacoes}>{folha.observacoes}</p>
        </div>
      ) : null}

      {cancelavel ? (
        <div className={styles.acoes}>
          <Button
            variant="danger"
            size="sm"
            onClick={onCancelar}
            aria-label={`Cancelar registro de ${dataFormatada}`}
          >
            Cancelar registro
          </Button>
        </div>
      ) : null}
    </article>
  );
}

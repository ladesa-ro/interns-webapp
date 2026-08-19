import React from 'react';
import styles from './RegistroPontoCard.module.css';

const RegistroPontoCard = ({
  data,
  horario,
  frequenciaMarcada,
  onMarcarFrequencia,
  habilitadoParaEnvio,
  onEnviar,
  enviado
}) => {
  // O botão fica verde/habilitado somente se for o primeiro pendente E a frequência estiver marcada E não tiver sido enviado.
  const podeEnviar = habilitadoParaEnvio && frequenciaMarcada && !enviado;

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.column}>
          <span className={styles.label}>Data</span>
          <span className={styles.value}>{data}</span>
        </div>
        <div className={styles.column}>
          <span className={styles.label}>Horario</span>
          <span className={styles.value}>{horario}</span>
        </div>
        <div className={styles.column}>
          <span className={styles.label}>Marcar frequência</span>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={frequenciaMarcada}
            onChange={(e) => onMarcarFrequencia(e.target.checked)}
            disabled={enviado} // Impede desmarcar se já enviou
          />
        </div>
      </div>
      <button
        className={`${styles.enviarButton} ${podeEnviar ? styles.enabled : styles.disabled} ${enviado ? styles.sent : ''}`}
        disabled={!podeEnviar}
        onClick={onEnviar}
      >
        {enviado ? 'Enviado' : 'Enviar'}
      </button>
    </div>
  );
};

export default RegistroPontoCard;

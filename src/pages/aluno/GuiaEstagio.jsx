import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './GuiaEstagio.module.css';
import { FileDown, Phone, Star } from 'lucide-react';

export default function GuiaEstagio() {
  const navigate = useNavigate();

  const handleContatoCIEEC = () => {
    navigate('/aluno/contato-cieec');
  };

  const handleAvaliarEmpresa = () => {
    // Provisório: Passando um UUID genérico para não quebrar validação de formato
    // Futuramente, isso deverá vir da lista de estágios concluídos pelo aluno
    navigate('/aluno/avaliar/00000000-0000-0000-0000-000000000000');
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <button
            type="button"
            onClick={handleContatoCIEEC}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Painel aluno
          </button>
        </h1>
        <h2 className={styles.subtitle}>Guia de Estágio</h2>
      </header>

      <section className={styles.contentArea}>
        <div className={styles.grid}>
          <button className={styles.card} aria-label="Modelo de relatório">
            <div className={styles.iconWrapper}>
              <FileDown size={40} strokeWidth={2.5} />
            </div>
            <span className={styles.cardTitle}>Modelo de relatório</span>
          </button>

          <button
            className={styles.card}
            aria-label="Contato CIEEC"
            onClick={handleContatoCIEEC}
          >
            <div className={styles.iconWrapper}>
              <Phone size={40} strokeWidth={2.5} />
            </div>
            <span className={styles.cardTitle}>Contato CIEEC</span>
          </button>

          <button
            className={styles.card}
            aria-label="Avaliar empresa"
            onClick={handleAvaliarEmpresa}
          >
            <div className={styles.iconWrapper}>
              <Star size={40} strokeWidth={2.5} />
            </div>
            <span className={styles.cardTitle}>Avaliar empresa</span>
          </button>
        </div>
      </section>
    </main>
  );
}
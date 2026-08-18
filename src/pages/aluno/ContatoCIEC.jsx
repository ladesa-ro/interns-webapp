import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ContatoCIEC.module.css';
import { ArrowLeft, Phone, Mail } from 'lucide-react';

export default function ContatoCIEC() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/aluno/guia-estagio');
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={handleBack}
          aria-label="Voltar para Guia de Estágio"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
          <span>Painel aluno</span>
        </button>
        <h2 className={styles.subtitle}>Contato CIEC</h2>
      </header>

      <section className={styles.cardsContainer}>
        <a href="tel:+5569999879742" className={styles.card}>
          <div className={styles.iconWrapper}>
            <Phone size={28} strokeWidth={2.5} />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardTitle}>Telefone</span>
            <span className={styles.cardValue}>(69) 9 9987-9742</span>
          </div>
        </a>

        <a href="mailto:ciec.ifro@gmail.com" className={styles.card}>
          <div className={styles.iconWrapper}>
            <Mail size={28} strokeWidth={2.5} />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardTitle}>Email</span>
            <span className={styles.cardValue}>ciec.ifro@gmail.com</span>
          </div>
        </a>
      </section>
    </main>
  );
}

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from '../../components/common/StarRating';
import styles from './AvaliarEmpresa.module.css';

// Tela ainda sem endpoint correspondente na API: os dados abaixo existem apenas
// para compor o layout e nao representam uma empresa real.
const EMPRESA_EXEMPLO = {
  nome: 'Tech Solutions S.A.',
  imagemUrl:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3',
};

const AvaliarEmpresa = () => {
  const navigate = useNavigate();
  // Obtém o ID do estágio ou da empresa a partir dos parâmetros da rota
  const { estagioId } = useParams();

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [empresa] = useState(EMPRESA_EXEMPLO);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [loading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setAviso('');

    // Validação dos campos
    if (nota === 0) {
      setErro('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    if (comentario.trim() === '') {
      setErro('Por favor, escreva um comentário sobre sua experiência na empresa.');
      return;
    }

    // A API ainda não expõe endpoint de avaliação; não afirmar envio concluído.
    setAviso(
      'Funcionalidade em desenvolvimento: sua avaliação ainda não pode ser enviada. ' +
        `Estágio de referência: ${estagioId ?? 'não informado'}.`
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          &larr; Painel aluno
        </button>
        <h1 className={styles.title}>Avaliar empresa</h1>
      </header>

      <main className={styles.content}>
        <div role="status" className={styles.errorMessage}>
          Tela em desenvolvimento: os dados exibidos são de exemplo e a avaliação
          ainda não é registrada no sistema.
        </div>

        {erro && <div className={styles.errorMessage}>{erro}</div>}
        {aviso && <div role="status" className={styles.errorMessage}>{aviso}</div>}

        <form onSubmit={handleSubmit} className={styles.evaluationForm}>
          
          <div className={styles.ratingSection}>
            <StarRating value={nota} onChange={setNota} />
          </div>

          <div className={styles.feedbackSection}>
            <div className={styles.inputGroup}>
              <label htmlFor="comentario" className={styles.label}>
                O que você achou da empresa em que estagiou?
              </label>
              <textarea
                id="comentario"
                className={styles.textarea}
                placeholder="Escreva aqui..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows="8"
              />
            </div>

            {empresa && (
              <div className={styles.companyCard}>
                <img 
                  src={empresa.imagemUrl} 
                  alt={`Fachada da empresa ${empresa.nome}`} 
                  className={styles.companyImage}
                />
                {/* Opcional: Renderizar nome da empresa abaixo da foto */}
                {/* <div className={styles.companyName}>{empresa.nome}</div> */}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AvaliarEmpresa;

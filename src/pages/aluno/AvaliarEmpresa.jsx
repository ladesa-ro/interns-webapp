import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from '../../components/common/StarRating';
import { buscarEmpresa, urlFotoEmpresa, avaliarEmpresa } from '../../utils/empresasApi';
import { mensagemDeErro } from '../../utils/api';
import styles from './AvaliarEmpresa.module.css';

const AvaliarEmpresa = () => {
  const navigate = useNavigate();
  const { empresaId } = useParams();
  
  // Se a rota falhar e não houver empresaId (mock local, etc)
  const isIdValido = Boolean(empresaId && empresaId !== '0');

  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [empresa, setEmpresa] = useState(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(isIdValido);
  const [erroEmpresa, setErroEmpresa] = useState(isIdValido ? '' : 'ID da empresa não fornecido.');
  
  const [erroForm, setErroForm] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEmpresa() {
      try {
        setLoadingEmpresa(true);
        setErroEmpresa('');
        const dadosEmpresa = await buscarEmpresa(empresaId, { signal: controller.signal });
        setEmpresa(dadosEmpresa);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErroEmpresa(mensagemDeErro(error));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingEmpresa(false);
        }
      }
    }

    if (isIdValido) {
      loadEmpresa();
    }

    return () => controller.abort();
  }, [empresaId, isIdValido]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroForm('');
    setSucesso('');

    if (nota === 0) {
      setErroForm('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setEnviando(true);
    try {
      await avaliarEmpresa(
        empresaId,
        {
          rating: nota,
          comentario: comentario.trim() || undefined,
        }
      );
      setSucesso('Sua avaliação foi enviada com sucesso! Muito obrigado pelo seu feedback.');
      setNota(0);
      setComentario('');
    } catch (error) {
      setErroForm(mensagemDeErro(error));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          &larr; Voltar
        </button>
        <h1 className={styles.title}>Avaliar empresa</h1>
      </header>

      <main className={styles.content}>
        {loadingEmpresa ? (
          <div role="status" aria-label="Carregando dados da empresa...">Carregando...</div>
        ) : erroEmpresa ? (
          <div role="alert" className={styles.errorMessage}>{erroEmpresa}</div>
        ) : !empresa ? (
          <div role="alert" className={styles.errorMessage}>Empresa não encontrada.</div>
        ) : (
          <>
            {erroForm && <div role="alert" className={styles.errorMessage}>{erroForm}</div>}
            {sucesso && <div role="status" className={styles.successMessage}>{sucesso}</div>}

            <form onSubmit={handleSubmit} className={styles.evaluationForm}>
              <div className={styles.ratingSection}>
                <StarRating value={nota} onChange={setNota} readOnly={enviando || !!sucesso} />
              </div>

              <div className={styles.feedbackSection}>
                <div className={styles.inputGroup}>
                  <label htmlFor="comentario" className={styles.label}>
                    O que você achou da empresa {empresa.nomeFantasia || empresa.razaoSocial}?
                  </label>
                  <textarea
                    id="comentario"
                    className={styles.textarea}
                    placeholder="Escreva aqui sobre sua experiência (opcional)..."
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows="8"
                    maxLength={2000}
                    disabled={enviando || !!sucesso}
                  />
                </div>

                <div className={styles.companyCard}>
                  <img
                    src={urlFotoEmpresa(empresa.id)}
                    alt={`Fachada da empresa ${empresa.nomeFantasia || empresa.razaoSocial}`}
                    className={styles.companyImage}
                  />
                  <div className={styles.companyName}>
                    {empresa.nomeFantasia || empresa.razaoSocial}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={enviando || nota === 0 || !!sucesso}
              >
                {enviando ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default AvaliarEmpresa;

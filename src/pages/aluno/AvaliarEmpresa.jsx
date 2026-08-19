import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from '../../components/common/StarRating';
import styles from './AvaliarEmpresa.module.css';

const AvaliarEmpresa = () => {
  const navigate = useNavigate();
  // Obtém o ID do estágio ou da empresa a partir dos parâmetros da rota
  const { estagioId } = useParams(); 
  
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [empresa, setEmpresa] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  // Efeito para simular a busca dos dados da empresa/estágio
  useEffect(() => {
    // Exemplo de integração futura com a API:
    // fetch(`/api/estagios/${estagioId}`).then(res => res.json()).then(data => setEmpresa(data.empresa))
    
    // Dados mocados para visualização do layout
    setEmpresa({
      nome: "Tech Solutions S.A.",
      imagemUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3" // Imagem genérica de escritório corporativo
    });
  }, [estagioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // Validação dos campos
    if (nota === 0) {
      setErro('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    if (comentario.trim() === '') {
      setErro('Por favor, escreva um comentário sobre sua experiência na empresa.');
      return;
    }

    setLoading(true);
    
    try {
      // Mock da função de avaliação na API:
      // await avaliarEmpresa(estagioId, { nota, comentario });
      
      // Simulando tempo de resposta da rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSucesso('Avaliação enviada com sucesso! Muito obrigado pelo seu feedback.');
      setNota(0);
      setComentario('');
      
      // Opcional: Redirecionar o usuário após o envio com sucesso
      // setTimeout(() => navigate('/aluno/painel'), 2000);
      
    } catch (error) {
      setErro('Ocorreu um erro ao enviar sua avaliação. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
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
        {erro && <div className={styles.errorMessage}>{erro}</div>}
        {sucesso && <div className={styles.successMessage}>{sucesso}</div>}

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

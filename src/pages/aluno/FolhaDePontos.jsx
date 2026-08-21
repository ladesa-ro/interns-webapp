import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistroPontoCard from '../../components/aluno/RegistroPontoCard';
import styles from './FolhaDePontos.module.css';

const FolhaDePontos = () => {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Busca inicial dos registros (Mock da API)
  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        // Simulando delay da rede (ex: fetch('/api/estagio/pontos'))
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados mocados simulando resposta da API
        const mockData = [
          { id: 1, data: '15/06/2026', horario: '13:30 - 17:30', enviado: false, frequenciaMarcada: false },
          { id: 2, data: '17/06/2026', horario: '13:30 - 17:30', enviado: false, frequenciaMarcada: false },
          { id: 3, data: '19/06/2026', horario: '13:30 - 17:30', enviado: false, frequenciaMarcada: false },
          { id: 4, data: '22/06/2026', horario: '13:30 - 17:30', enviado: false, frequenciaMarcada: false },
        ];
        
        setRegistros(mockData);
      } catch {
        setErro('Ocorreu um erro ao carregar a folha de pontos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistros();
  }, []);

  const handleMarcarFrequencia = (id, valor) => {
    setRegistros(prev => 
      prev.map(reg => reg.id === id ? { ...reg, frequenciaMarcada: valor } : reg)
    );
  };

  // A API ainda nao expoe endpoint de envio de frequencia: nao marcar como
  // enviado, o que faria a interface afirmar uma persistencia inexistente.
  const enviarFrequencia = async () => {
    setErro(
      'Funcionalidade em desenvolvimento: o envio de frequência ainda não está disponível.'
    );
  };

  // Encontra qual é o índice do primeiro registro que AINDA NÃO FOI ENVIADO.
  // Assim, a gente só habilita o botão deste registro específico.
  const primeiroPendenteIndex = registros.findIndex(reg => !reg.enviado);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          &larr; Painel aluno
        </button>
        <h2 className={styles.subtitle}>Folha de pontos</h2>
      </header>

      <main className={styles.content}>
        {loading && <p className={styles.loadingText}>Carregando folha de pontos...</p>}
        {erro && <div className={styles.errorMessage}>{erro}</div>}
        
        {!loading && !erro && (
          <div className={styles.listaRegistros}>
            {registros.map((registro, index) => {
              // Habilita para envio apenas o primeiro registro pendente na ordem cronológica
              const habilitadoParaEnvio = index === primeiroPendenteIndex;

              return (
                <RegistroPontoCard
                  key={registro.id}
                  data={registro.data}
                  horario={registro.horario}
                  frequenciaMarcada={registro.frequenciaMarcada}
                  enviado={registro.enviado}
                  onMarcarFrequencia={(valor) => handleMarcarFrequencia(registro.id, valor)}
                  habilitadoParaEnvio={habilitadoParaEnvio}
                  onEnviar={() => enviarFrequencia(registro.id)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default FolhaDePontos;

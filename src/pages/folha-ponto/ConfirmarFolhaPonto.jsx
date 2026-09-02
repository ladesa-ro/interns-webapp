import { useState } from "react";
import { useParams } from "react-router-dom";

import styles from "./ConfirmarFolhaPonto.module.css";
import { Button } from "../../components/ui";
import {
  MENSAGENS_TOKEN,
  ResultadoToken,
  confirmarFolhaPontoPorToken,
} from "../../utils/folhaPontoTokenApi";

// Fluxo público do supervisor. O token vem da URL e não é exibido, persistido
// nem enviado para qualquer destino além do endpoint documentado.
export default function ConfirmarFolhaPonto() {
  const { tokenId } = useParams();
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const tokenAusente = !tokenId;
  const concluido = resultado !== null;

  async function confirmar() {
    if (enviando || concluido) return;

    setEnviando(true);
    // Sem retry automático: cada confirmação exige uma nova ação do supervisor.
    const retorno = await confirmarFolhaPontoPorToken(tokenId);
    setResultado(retorno);
    setEnviando(false);
  }

  return (
    <main className={styles.pagina}>
      <section className={styles.cartao}>
        <h1 className={styles.titulo}>Confirmação de folha de ponto</h1>

        {tokenAusente ? (
          <p className={styles.mensagemErro}>
            Link de confirmação incompleto. Utilize o link enviado por e-mail.
          </p>
        ) : (
          <>
            <p className={styles.descricao}>
              Ao confirmar, a ação solicitada para esta folha de ponto será
              registrada no sistema de estágios do IFRO.
            </p>

            <div aria-live="polite" className={styles.area}>
              {concluido ? (
                <p
                  className={
                    resultado === ResultadoToken.SUCESSO
                      ? styles.mensagemSucesso
                      : styles.mensagemErro
                  }
                >
                  {MENSAGENS_TOKEN.get(resultado)}
                </p>
              ) : null}
            </div>

            {!concluido ? (
              <Button onClick={confirmar} loading={enviando} fullWidth>
                Confirmar
              </Button>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

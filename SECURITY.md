# Política de Segurança

Este projeto é o front-end web do sistema de gestão de estágios do IFRO Campus
Ji-Paraná, mantido pelo LADESA. O software está **em desenvolvimento ativo** e
ainda não possui versões estáveis publicadas.

## Versões suportadas

Não há linhas de versão com suporte estendido. Correções de segurança são
aplicadas somente na branch `main` e nas branches de trabalho ativas.

| Alvo | Suportado |
| --- | --- |
| `main` | Sim |
| Branches de trabalho ativas | Sim |
| Forks e cópias antigas | Não |

## Como reportar uma vulnerabilidade

Envie um e-mail para **ladesa.sisgea@gmail.com** com:

- descrição do problema e do impacto potencial;
- passos para reproduzir;
- versão, branch ou commit analisado;
- evidências, sem incluir dados pessoais de terceiros.

Não abra issue pública para falhas de segurança. Como o repositório é público,
uma issue expõe o problema antes da correção.

### Prazos de resposta

Estes prazos são objetivos de melhor esforço, não garantias contratuais.

| Etapa | Prazo alvo |
| --- | --- |
| Confirmação de recebimento | 5 dias úteis |
| Triagem inicial e classificação | 10 dias úteis |
| Retorno sobre aceite ou recusa | 15 dias úteis |

Relatos aceitos recebem atualização de progresso até a correção. Relatos
recusados recebem justificativa técnica.

## Se uma credencial for exposta

Se você identificar credenciais, tokens ou segredos no código, no histórico do
Git ou em logs:

1. **Não** publique, teste ou compartilhe o valor encontrado.
2. Comunique imediatamente pelo e-mail acima, informando apenas o caminho do
   arquivo, o commit e o tipo de segredo.
3. A equipe deve **rotacionar a credencial primeiro**, antes de qualquer limpeza
   de histórico. Remover o segredo do Git não invalida o que já vazou.
4. Somente depois da rotação, remover o segredo do histórico e forçar a
   atualização das branches afetadas, avisando o time para re-clonar.
5. Registrar o incidente e revisar os logs de acesso do período.

## Práticas adotadas no repositório

- Segredos não são versionados; `.env` está no `.gitignore` e `.env.example`
  documenta as variáveis sem valores.
- Um hook de pré-commit executa o `gitleaks` com regras próprias definidas em
  `.gitleaks.toml`, cobrindo padrões de credenciais em texto.
- O pipeline de integração contínua executa lint, build, auditoria de
  dependências e varredura de segredos.
- Tokens de autenticação não são gravados em `localStorage` nem em
  `sessionStorage`.

## Limitações conhecidas

- A `Content-Security-Policy` é entregue por `<meta>` no `index.html`. A
  diretiva `frame-ancestors` é ignorada nesse formato e precisa ser enviada como
  cabeçalho HTTP pelo servidor ou CDN de hospedagem.
- A migração da autenticação para cookie `httpOnly` depende de alterações no
  backend, descritas em `ISSUE_BACKEND_AUTH_COOKIE.md`.

# Relatório de entrega: fluxos de estágio do aluno

Data: 2026-09-07
Branch: `91-solicitacao-estagio-vagas`
API consultada: `https://dev.ladesa.com.br/api/v1/docs/openapi.v3.json`

## 1. Resumo executivo

A API atual possui contratos para:

- listar estágios disponíveis;
- candidatar o aluno autenticado a um estágio;
- consultar posição e situação da candidatura;
- aceitar uma oferta;
- cancelar uma candidatura;
- solicitar estágio interno ou externo;
- consultar e cancelar solicitações próprias.

O frontend foi conectado a esses contratos sem alterar autenticação, autorização, AppShell ou tokens de design. Nenhuma funcionalidade de presença diária foi simulada, porque a API não publica um endpoint de frequência diária.

## 2. Tarefa 1: cadastro de estágio interno e externo

### Contrato confirmado

O `EstagioFindOneOutputDto` atual possui `campus`, `empresa`, `CursoReferencia` e `status`, mas não possui campo de tipo/modalidade:

```json
{
  "campus": { "type": "object" },
  "empresa": { "type": "object" },
  "CursoReferencia": { "type": "object", "nullable": true },
  "status": {
    "type": "string",
    "enum": ["DISPONIVEL", "EM_FASE_INICIAL", "EM_ANDAMENTO", "RESCINDIDO", "COM_PENDENCIA", "ENCERRADO", "APTO_PARA_ENCERRAMENTO"]
  }
}
```

Há endpoints separados de solicitação:

- `POST /solicitacoes-estagio/interno`
- `POST /solicitacoes-estagio/externo`

O DTO interno exige `professorConselheiro`, `local` e `descricao`, mas documenta `professorConselheiro` somente como `object`, sem propriedades ou `$ref`.

O DTO externo exige `empresa` e `supervisor`, com `empresa.razaoSocial` e `empresa.cnpj` e `supervisor.nome` obrigatórios.

### Implementado

- Formulário externo em [SolicitarEstagio.jsx](src/pages/aluno/inicio/solicitar-estagio/SolicitarEstagio.jsx).
- `POST /solicitacoes-estagio/externo` com os campos documentados.
- Histórico via `GET /minhas-solicitacoes`.
- Cancelamento de solicitações `PENDENTE`/`EM_ANALISE` via `DELETE /minhas-solicitacoes/{id}` com confirmação.

### Pendência

Não foi inventado `tipoEstagio` local. A ausência do campo foi documentada em [ISSUE_BACKEND_ESTAGIO_FLUXOS.md](ISSUE_BACKEND_ESTAGIO_FLUXOS.md). O backend deve publicar `tipoEstagio: INTERNO | EXTERNO` em Estágio e nos DTOs relacionados.

O envio interno permanece bloqueado até a definição de `professorConselheiro`.

## 3. Tarefa 2: listagem de vagas ao candidatar-se

### Contrato confirmado

A listagem usa:

```http
GET /estagios?page=1&limit=12&filter.status=DISPONIVEL
```

O DTO retorna `empresa`, `CursoReferencia`, `campus`, `cargaHoraria`, `nomeSupervisor`, `emailSupervisor` e `telefoneSupervisor` quando populados.

A resposta de lista usa:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 12
}
```

### Implementado

- [VagasDisponiveis.jsx](src/pages/aluno/VagasDisponiveis.jsx) usa `Card`, `LoadingState`, `EmptyState` e `ErrorState`.
- A lista exibe nome da empresa, curso, carga horária, localização e supervisor.
- A localização externa vem de `empresa.endereco`.
- O campo Campus só aparece quando `campus` está presente.
- O frontend não chama `POST /empresas` pelo aluno.
- O botão `Candidatar-se` navega para a tela de solicitação com a vaga em `location.state`.

### Pendência

A API não publica tipo/modalidade no item de estágio. O frontend não infere “externo” ou “interno” a partir da existência de campus. Esse requisito está documentado no issue de backend.

## 4. Tarefa 3: preenchimento manual do estágio do aluno

### Fluxo confirmado

As rotas de solicitação interna/externa são descritas como operações do estudante autenticado e retornam `401`, `403` e `409`. A criação oficial do estágio é responsabilidade posterior do CIEC, por meio do deferimento da solicitação.

O frontend não usa `POST /estagios` para o aluno e não altera estágio diretamente.

### Implementado

- O formulário externo é editável mesmo quando veio pré-preenchido por uma vaga.
- O aluno pode corrigir os campos antes de enviar a solicitação externa.
- A candidatura de uma vaga selecionada é uma ação explícita em `POST /estagios/{estagioId}/candidaturas` sem body.

### Pendência

O formulário interno aguarda o schema de `professorConselheiro` e uma possível rota de professores elegíveis.

## 5. Tarefa 4: registro de frequência diária

### Contrato confirmado

A API publica somente folha de ponto:

- `GET /folha-ponto`
- `POST /folha-ponto`
- `GET /folha-ponto/{id}`
- `DELETE /folha-ponto/{id}`
- confirmação pública por token

O DTO possui `data`, `horaInicio`, `horaFim`, `observacoes` e status da folha. Não há rota documentada para presença/ausência diária de um estágio.

A busca no frontend não encontrou `QUEUE_FOLHA_PONTO_WHATSAPP`; as rotas públicas de WhatsApp são pairing code, envio, status e webhook. Não foi possível confirmar pela API se existe uma fila interna de folha de ponto com semântica de presença diária.

### Implementado

A tela existente de Folha de Ponto permanece usando os contratos reais de folha de ponto. Não foi criada uma agenda diária que grava apenas no estado React.

### Pendência de alta prioridade

Publicar contrato para presença diária, por exemplo:

```http
POST /estagios/{estagioId}/frequencia
```

```json
{
  "data": "2026-09-07",
  "status": "PRESENTE",
  "observacoes": "opcional"
}
```

Também definir GET por período, idempotência por aluno/data, timezone, alteração/cancelamento e permissões.

## 6. Tarefa 5: lista de espera e candidatura pré-preenchida

### Contrato confirmado

A API publica:

```http
POST /estagios/{estagioId}/candidaturas
GET /minhas-candidaturas
DELETE /minhas-candidaturas/{candidaturaId}
POST /minhas-candidaturas/{candidaturaId}/aceitar
```

O DTO de candidatura possui:

```json
{
  "situacao": "PENDING | OFFERED | ACCEPTED | REJECTED | CANCELLED | EXPIRED",
  "posicaoFila": 2,
  "dataInscricao": "...",
  "dataOferta": "...",
  "expiraEm": "...",
  "dataResposta": "...",
  "acaoDisponivel": true,
  "estagio": {}
}
```

### Implementado

- [ListaEsperaAluno.jsx](src/pages/aluno/ListaEsperaAluno.jsx) consulta `GET /minhas-candidaturas`.
- Exibe empresa, curso, posição e situação.
- “Aceitar vaga” aparece somente quando `acaoDisponivel === true`.
- Aceite e cancelamento exigem confirmação.
- Candidatura é enviada somente depois que o aluno abre a tela pré-preenchida e clica em “Candidatar-se nesta vaga”.
- O estado de navegação usa React Router; não há localStorage nem variável global.
- A tela continua editável após o preenchimento.

### Pendência

O DTO resumido de estágio dentro da candidatura não documenta `tipoEstagio`. Esse campo deve ser incluído se a Lista de Espera precisar mostrar a modalidade com autoridade do backend.

## 7. Pendências consolidadas para issues

1. Adicionar `tipoEstagio: INTERNO | EXTERNO` ao Estágio e DTOs relacionados.
2. Definir o schema completo de `professorConselheiro`.
3. Publicar endpoint/contrato de professores elegíveis para solicitação interna.
4. Incluir tipo/modalidade no DTO resumido de candidatura.
5. Criar contrato de presença diária por estágio, com idempotência e período.
6. Documentar a semântica de `QUEUE_FOLHA_PONTO_WHATSAPP`, caso exista no backend.
7. Publicar limites de tamanho e validações de `local` e `descricao` do estágio interno.

## 8. Validação

- `npm run lint`: aprovado.
- `npm test`: executar no gate final; a suíte deve cobrir candidatura, navegação pré-preenchida, solicitação externa, fila e cancelamentos.
- `npm run build`: executar no gate final.
- `npm audit --omit=dev --audit-level=high`: executar no gate final.
- `gitleaks dir . --config .gitleaks.toml --redact`: executar no gate final.
- `git diff --check`: executar no gate final.

## 9. Arquivos de segurança preservados

Não foram alterados autenticação, Bearer token, derivação de perfil, autorização, AppShell ou tokens do design system.

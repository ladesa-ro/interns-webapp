# Pendências de backend: estágio, candidatura e frequência

## Resumo

A API atual permite listar estágios, candidatar-se a uma vaga, consultar candidaturas e enviar solicitações interna/externa. Ainda existem lacunas que impedem o frontend de afirmar com segurança a modalidade do estágio e registrar presença diária.

## 1. Diferenciar estágio interno e externo

### Confirmado

O schema atual de `EstagioFindOneOutputDto` possui `campus`, `empresa`, `CursoReferencia` e `status`, mas não possui `tipo`, `modalidade` ou enum equivalente:

```json
{
  "campus": { "type": "object" },
  "empresa": { "type": "object" },
  "CursoReferencia": { "type": "object", "nullable": true },
  "status": {
    "type": "string",
    "enum": [
      "DISPONIVEL",
      "EM_FASE_INICIAL",
      "EM_ANDAMENTO",
      "RESCINDIDO",
      "COM_PENDENCIA",
      "ENCERRADO",
      "APTO_PARA_ENCERRAMENTO"
    ]
  }
}
```

### Problema

Não é seguro inferir `INTERNO` pela existência de `campus`, nem `EXTERNO` pela existência de `empresa`. O mesmo estágio pode possuir referências a campus e empresa por motivos de operação, e essa regra não está documentada.

### Proposta

Adicionar no input e output de estágio:

```json
{
  "tipoEstagio": "INTERNO"
}
```

Enum permitido: `INTERNO | EXTERNO`. O campo deve estar disponível em `GET/POST/PATCH/PUT /estagios` e nos DTOs de candidatura.

## 2. Candidatura e lista de espera

### Confirmado

A API possui:

- `POST /estagios/{estagioId}/candidaturas`
- `GET /minhas-candidaturas`
- `DELETE /minhas-candidaturas/{candidaturaId}`
- `POST /minhas-candidaturas/{candidaturaId}/aceitar`

A resposta de candidatura documenta `situacao`, `posicaoFila`, `dataInscricao`, `dataOferta`, `expiraEm`, `dataResposta` e `acaoDisponivel`.

### Pendência

O retorno resumido de `EstagioCandidaturaEstagioRefDto` não documenta `tipoEstagio`, então a Lista de Espera não pode exibir a modalidade com autoridade do backend. Incluir o campo no DTO ou garantir uma referência completa de estágio.

## 3. Solicitações internas

### Confirmado

Existe:

```http
POST /solicitacoes-estagio/interno
```

O DTO exige `professorConselheiro`, `local` e `descricao`, mas `professorConselheiro` aparece somente como `object`, sem propriedades ou `$ref`.

### Pendências

Publicar:

- schema do objeto `professorConselheiro`;
- endpoint para listar professores elegíveis, caso o aluno deva selecionar um professor;
- campos e permissões para o fluxo do aluno;
- limites de tamanho e regras de validação de `local` e `descricao`.

## 4. Presença diária

### Confirmado

A API possui `GET/POST/DELETE /folha-ponto` para folhas de ponto com `data`, `horaInicio`, `horaFim`, `observacoes` e status `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `CANCELLED`.

O frontend também possui fluxo de confirmação por token e busca de folhas.

### Problema

Não existe endpoint documentado para registrar presença diária com status de presença/ausência. A folha de ponto não equivale automaticamente a um registro diário de frequência.

A variável `QUEUE_FOLHA_PONTO_WHATSAPP` não foi encontrada no frontend. O contrato público consultado também não prova que essa fila represente presença diária interativa.

### Proposta

Publicar um contrato específico, por exemplo:

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

Definir também GET por estágio/período, alteração/cancelamento, estados, idempotência por aluno/data, timezone e permissões.

## 5. Cadastro manual em nome do aluno

O frontend não deve usar `POST /estagios` no fluxo do aluno: a operação retorna `403` para autorização inadequada e representa criação administrativa de estágio. O aluno deve usar as solicitações `/solicitacoes-estagio/interno` ou `/solicitacoes-estagio/externo`; o CIEC deve deferir a solicitação para gerar o estágio.

Publicar claramente as permissões por operação na OpenAPI e manter o backend como autoridade final.

## Revisão de pendências em 2026-09-07

### Item 1 e Item 5: tipo do estágio

**Alegação revisada:** campus implica interno e empresa implica externo.

**Verificação:** a OpenAPI continua sem `tipoEstagio`; `campus` e `empresa` são propriedades independentes no `EstagioFindOneOutputDto`. Tentamos obter a maior página de `GET /estagios?page=1&limit=1000000`, mas o ambiente retornou literalmente `401 Unauthorized`, portanto não foi possível confirmar uma amostra real. Também não há constraint de exclusividade publicada no schema.

**Decisão:** parcialmente confirmado como regra de negócio verbal, não confirmado como garantia do sistema. A pendência foi rebaixada para prioridade baixa, mas permanece: confirmar com o backend se existe constraint de banco/aplicação que proíba campus e empresa simultaneamente ou ambos ausentes. Se o sistema atender múltiplos institutos, recomenda-se `tipoEstagio: INTERNO | EXTERNO`.

O Item 5 foi unificado neste item: o DTO resumido de candidatura também não possui modalidade.

### Item 2: `professorConselheiro`

**Alegação revisada:** o campo seria um nome textual.

**Verificação:** a OpenAPI continua declarando:

```json
"professorConselheiro": {
  "type": "object",
  "description": "Professor conselheiro / orientador institucional"
}
```

Tentamos `POST /solicitacoes-estagio/interno` com string, mas sem credencial de aluno o ambiente retornou literalmente `401 Unauthorized`; portanto a API não chegou à validação do campo.

**Decisão:** não confirmado. A prioridade foi rebaixada para “aguardando confirmação de formato”, mas o schema permanece pendente. O frontend agora consulta professores por GET, mas não envia a solicitação interna até o formato ser confirmado.

### Item 3: presença diária e folha de ponto

**Verificação:** a API publica `POST /folha-ponto` com `data`, `horaInicio`, `horaFim` e `observacoes`, além de status PENDING/APPROVED/REJECTED/EXPIRED/CANCELLED e confirmação por token. Não existe endpoint documentado com `status PRESENTE/AUSENTE` por dia. A tela atual registra uma folha real e exibe histórico, status e cancelamento; não grava presença localmente.

Não encontramos `QUEUE_FOLHA_PONTO_WHATSAPP` no frontend. A OpenAPI atual expõe apenas pairing code, envio, status e webhook de WhatsApp, sem declarar a relação automática com folha de ponto.

**Decisão:** parcialmente confirmado. Não é correto afirmar que WhatsApp cobre presença diária sem documentação do fluxo. Remover a proposta de endpoint novo somente se o backend declarar explicitamente que folha de ponto é o mecanismo oficial; até lá, a pendência passa a ser documentação de integração e semântica.

### Item 4: professores elegíveis

**Verificação de contrato:** `GET /perfis` aceita `filter.cargo.nome` e `filter.campus.id`. `PerfilFindOneOutputDto` retorna `cargo`, `campus` e `usuario`. `GET /autenticacao/quem-sou-eu` retorna `perfisAtivos`, cujo campus pode ser usado para montar o filtro.

**Verificação ao vivo:** sem sessão, tanto `/perfis` quanto `quem-sou-eu` retornaram `401 Unauthorized`. Portanto o caminho foi confirmado no contrato, mas não validado com dados reais.

**Implementação:** o formulário interno carrega a lista com `GET /autenticacao/quem-sou-eu` e `GET /perfis?filter.cargo.nome=professor&filter.campus.id=...`. A submissão continua bloqueada pela pendência de `professorConselheiro`.

### Item 6: WhatsApp

**Decisão:** não houve alteração de código. A OpenAPI não documenta o vínculo automático com folha de ponto. Permanece pendência de documentação: descrever queue, gatilho, payload, retries e estados do envio.

### Item 7: limites de `local` e `descricao`

Mantida como pendência de baixa prioridade. O schema atual não publica limites de tamanho nem validações suficientes para esses campos.

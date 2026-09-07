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

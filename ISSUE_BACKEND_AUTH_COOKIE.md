# [Backend] Migrar autenticação de JWT em resposta JSON para cookie httpOnly

**Tipo:** Segurança / Autenticação
**Prioridade:** Alta
**Depende de:** rotação das credenciais expostas (tarefa separada)
**Relacionado:** remediação de segurança já aplicada no `interns-webapp` (front-end)

## Contexto

Verificado contra a especificação real da API (`GET /api/v1/docs/openapi.v3.json`,
*Ladesa Management Service API 1.0*). O estado atual é:

- `securitySchemes` define **apenas** `bearer` (HTTP Bearer JWT); não há esquema de cookie;
- `POST /autenticacao/login` responde `201` com `AuthSessionCredentialsDto`
  (`access_token`, `refresh_token`, `token_type`, `id_token`, `expires_in`);
- a sessão é consultada em `GET /autenticacao/quem-sou-eu`, que responde `200`
  com `{ usuario, perfisAtivos }` e `usuario: null` quando não autenticado;
- **não existe endpoint de logout**;
- a API responde `Access-Control-Allow-Origin: *`, sem `Allow-Credentials`.

O front-end está preparado para os dois modelos através da variável
`VITE_AUTH_MODE` (`bearer` por padrão, `cookie` quando o backend estiver pronto).

> **Bloqueio atual:** enquanto o CORS responder `*`, qualquer requisição com
> `credentials: "include"` é recusada pelo navegador. Isso foi confirmado em
> execução: `The value of the 'Access-Control-Allow-Origin' header in the
> response must not be the wildcard '*' when the request's credentials mode is
> 'include'`. Portanto o item 2 abaixo é pré-requisito de todos os demais.

Com o modelo atual, o token permanece apenas em memória e **a sessão é perdida a
cada reload da página**. Essa é a principal motivação desta issue.

O front-end não pode resolver isso sozinho: um cookie `httpOnly` só pode ser
criado pelo servidor via `Set-Cookie`, e é justamente essa restrição que o
protege contra leitura por XSS.

## O que precisa ser implementado

### 1. Emitir o JWT como cookie httpOnly no login

`POST /autenticacao/login`, em caso de sucesso, deve responder com `Set-Cookie` em vez de (ou além de, durante a transição) `access_token` no corpo.

Atributos obrigatórios:

| Atributo | Valor | Motivo |
|---|---|---|
| `HttpOnly` | sim | Impede leitura por JavaScript, mitigando roubo de token via XSS |
| `Secure` | sim | Restringe o envio a HTTPS |
| `SameSite` | `Strict` ou `Lax` | Mitiga CSRF; usar `Lax` se houver navegação cross-site legítima |
| `Path` | `/` | Disponível para toda a API |
| `Max-Age` / `Expires` | alinhado ao `exp` do JWT | Evita cookie válido além do token |

Definir também o domínio correto do cookie para o ambiente (`dev.ladesa.com.br` e produção).

### 2. Configurar CORS para credenciais

Como o front-end envia `credentials: "include"`, o backend precisa responder com:

- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Origin` com a **origem explícita** do front-end (não `*`, que é inválido com credenciais)
- `Access-Control-Allow-Headers` incluindo o header de CSRF definido no item 4

### 3. Endpoint de sessão

O endpoint já existe e **não precisa ser criado**:

```
GET /autenticacao/quem-sou-eu
```

Hoje ele responde `200` com `usuario: null` para anônimos, o que é aceitável e já
é tratado pelo front-end. O necessário é que ele passe a **reconhecer a sessão
por cookie**, e não apenas pelo header `Authorization`.

O papel já vem de forma explícita em `perfisAtivos[].cargo`, com o campo `ativo`
para filtrar vínculos, além de `usuario.isSuperUser`. O front-end passou a usar
esses campos e **eliminou as heurísticas** que antes inferiam o papel pelo texto
do JWT e pela quantidade de dígitos da matrícula.

> **Pedido complementar:** documentar os valores possíveis de `cargo`. Hoje a
> especificação declara apenas `string`, sem enum. Uma amostra de 800 registros
> em `GET /perfis` retornou `aluno`, `dape`, `professor` e vazio. O front-end
> nega acesso administrativo quando o cargo é vazio ou desconhecido, então
> cargos não documentados resultam em usuários sem acesso.

### 4. Proteção CSRF

Ao migrar de header `Authorization` para cookie, o CSRF deixa de ser mitigado automaticamente e passa a exigir defesa explícita.

- `SameSite=Strict` já cobre a maior parte dos cenários.
- Para defesa em profundidade, adotar **double-submit token**: o backend emite um cookie adicional **não-`httpOnly`** chamado `csrf_token`, e valida o valor recebido no header `X-CSRF-Token` em requisições `POST`, `PUT`, `PATCH` e `DELETE`.

O front-end **já está preparado** para esse formato: `src/utils/api.js` lê o cookie `csrf_token` e reenvia o valor no header `X-CSRF-Token` nos métodos de mutação. Se o backend adotar outro nome de cookie ou header, é necessário avisar para ajustar o front-end.

### 5. Endpoint de logout

**Não existe hoje** e precisa ser criado:

```
POST /autenticacao/logout
```

Deve invalidar a sessão no servidor e expirar o cookie via `Set-Cookie` com
`Max-Age=0`. O front-end não consegue apagar um cookie `httpOnly` por conta
própria; enquanto o endpoint não existir, o logout apenas limpa o estado local.

## Critérios de aceite

- [ ] CORS responde com origem explícita e `Access-Control-Allow-Credentials: true` (pré-requisito).
- [ ] Login responde com `Set-Cookie` contendo `HttpOnly`, `Secure` e `SameSite`.
- [ ] `GET /autenticacao/quem-sou-eu` reconhece a sessão por cookie.
- [ ] Valores de `cargo` documentados na especificação OpenAPI.
- [ ] Cookie `csrf_token` emitido e header `X-CSRF-Token` validado nas mutações.
- [ ] `POST /autenticacao/logout` criado, expirando o cookie e invalidando a sessão.
- [ ] Sessão sobrevive ao reload da página no front-end.
- [ ] Requisição de mutação sem CSRF token válido é rejeitada.

## Plano de transição sugerido

Para não quebrar o front-end em produção durante a migração:

1. Backend corrige o CORS para origem explícita com `Allow-Credentials: true`.
2. Backend passa a emitir o cookie **mantendo** `access_token` no corpo temporariamente.
3. Front-end passa a rodar com `VITE_AUTH_MODE=cookie` em ambiente de teste.
4. Backend remove `access_token` do corpo da resposta.

## Fora do escopo desta issue

- Rotação das credenciais expostas (tarefa separada, prioridade maior).
- Limpeza do histórico do Git no repositório do front-end.

# [Backend] Migrar autenticação de JWT em resposta JSON para cookie httpOnly

**Tipo:** Segurança / Autenticação
**Prioridade:** Alta
**Depende de:** rotação das credenciais expostas (tarefa separada)
**Relacionado:** remediação de segurança já aplicada no `interns-webapp` (front-end)

## Contexto

O front-end já foi preparado para autenticação baseada em cookie:

- `src/utils/api.js` envia `credentials: "include"` em todas as requisições;
- o header `Authorization: Bearer` foi removido;
- o JWT não é mais persistido em `localStorage`.

Hoje `POST /autenticacao/login` responde com `access_token` no corpo JSON. Enquanto o backend não emitir o cookie, o token fica apenas em memória no front-end, o que significa que **a sessão é perdida a cada reload da página**. Esta issue descreve o contrato necessário para fechar essa lacuna.

O front-end não pode implementar isso sozinho: um cookie `httpOnly` só pode ser criado pelo servidor via `Set-Cookie`, e é justamente essa restrição que o protege contra leitura por XSS.

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

### 3. Endpoint de sessão (bloqueador para o reload)

Como o front-end não consegue ler o cookie `httpOnly`, ele precisa de um endpoint para descobrir quem é o usuário logado ao carregar a aplicação.

```
GET /autenticacao/sessao        (ou /autenticacao/eu)
```

- **200**: retorna os dados necessários para a UI — identificador do usuário, nome, e o **perfil/papel de forma explícita** (ex.: `"aluno"` ou `"admin"`), além de matrícula se aplicável.
- **401**: quando não há sessão válida.

> **Observação importante:** hoje o front-end infere o perfil aplicando heurísticas sobre o payload do JWT (busca por termos como "aluno"/"servidor" e checagem do formato da matrícula por quantidade de dígitos). Isso é frágil e propenso a erro. Retornar o papel de forma explícita neste endpoint permite eliminar essas heurísticas.

### 4. Proteção CSRF

Ao migrar de header `Authorization` para cookie, o CSRF deixa de ser mitigado automaticamente e passa a exigir defesa explícita.

- `SameSite=Strict` já cobre a maior parte dos cenários.
- Para defesa em profundidade, adotar **double-submit token**: o backend emite um cookie adicional **não-`httpOnly`** chamado `csrf_token`, e valida o valor recebido no header `X-CSRF-Token` em requisições `POST`, `PUT`, `PATCH` e `DELETE`.

O front-end **já está preparado** para esse formato: `src/utils/api.js` lê o cookie `csrf_token` e reenvia o valor no header `X-CSRF-Token` nos métodos de mutação. Se o backend adotar outro nome de cookie ou header, é necessário avisar para ajustar o front-end.

### 5. Endpoint de logout

```
POST /autenticacao/logout
```

Deve invalidar a sessão no servidor e expirar o cookie via `Set-Cookie` com `Max-Age=0`. O front-end não consegue apagar um cookie `httpOnly` por conta própria.

## Critérios de aceite

- [ ] Login responde com `Set-Cookie` contendo `HttpOnly`, `Secure` e `SameSite`.
- [ ] CORS configurado com origem explícita e `Allow-Credentials: true`.
- [ ] `GET /autenticacao/sessao` retorna usuário e papel explícito, e `401` sem sessão.
- [ ] Cookie `csrf_token` emitido e header `X-CSRF-Token` validado nas mutações.
- [ ] `POST /autenticacao/logout` expira o cookie e invalida a sessão.
- [ ] Sessão sobrevive ao reload da página no front-end.
- [ ] Requisição de mutação sem CSRF token válido é rejeitada.

## Plano de transição sugerido

Para não quebrar o front-end em produção durante a migração:

1. Backend passa a emitir o cookie **mantendo** `access_token` no corpo temporariamente.
2. Front-end passa a usar o endpoint de sessão e para de ler `access_token`.
3. Backend remove `access_token` do corpo da resposta.

## Fora do escopo desta issue

- Rotação das credenciais expostas (tarefa separada, prioridade maior).
- Limpeza do histórico do Git no repositório do front-end.

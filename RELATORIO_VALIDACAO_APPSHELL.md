# Relatório de Validação Autenticada do AppShell

## 1. Resumo executivo

O AppShell foi validado com sessões reais dos perfis CIEC e Aluno, usando a API de desenvolvimento, autenticação Bearer e os endpoints existentes. A matriz visual e funcional cobriu 1440, 1280, 1024, 768 e 390 px.

A validação encontrou e corrigiu três problemas no shell: overflow do documento causado por conteúdo legado largo, drawer sem semântica e contenção de foco, e nomes acessíveis duplicados para fechamento. Também foi removido o atributo SVG inválido `height="auto"` dos wrappers já existentes.

Não houve migração de páginas, criação de componentes ou alteração de API, autenticação, autorização, rotas, DTOs e endpoints.

**Decisão de liberação:** o AppShell está aprovado e não bloqueia o início da migração de login e dashboard. Os débitos de tabelas e modais legados devem ser tratados dentro da migração das respectivas páginas.

## 2. Ambiente de validação

- Aplicação: React 19, Vite 8 e React Router 7.
- API: `https://dev.ladesa.com.br/api/v1`.
- Autenticação: sessão real com Bearer JWT mantido em memória.
- Perfis exercitados: CIEC e Aluno.
- Viewports: 1440, 1280, 1024, 768 e 390 px.
- Ambiente temporário: Vite em `http://localhost:5175`, com proxy local `/api/v1` para contornar exclusivamente o CORS de localhost.
- O proxy foi criado fora do repositório, em `/tmp/interns-vite-validation.config.mjs`, sem alteração no código da aplicação.

## 3. Problemas encontrados por breakpoint e elemento

| Breakpoint | Elemento | Resultado inicial | Resultado final |
|---|---|---|---|
| 1440 px | Sidebar fixa/recolhível | Funcionamento correto; largura recolhida de 64 px | Mantido |
| 1280 px | Sidebar e conteúdo | Sem overflow do documento | Mantido |
| 1024 px | Sidebar + tabela CIEC | A sidebar fixa deixava apenas 773 px e a tabela legada de 816 px levava o documento a 1104 px | Drawer ativado em 1024 px inclusive; conteúdo largo fica contido em scroll horizontal no `main` |
| 768 px | Drawer | Abria visualmente, mas o fundo continuava navegável por teclado e o foco não entrava no drawer | `role="dialog"`, `aria-modal`, fundo `inert`, foco inicial e focus trap implementados |
| 390 px | Drawer | Overlay e botão X tinham o mesmo nome acessível; foco escapava para o conteúdo | Overlay removido da árvore acessível/tabulação; existe um único botão “Fechar menu de navegação” |
| Todos | SVGs de logo/mascote | O navegador reportava `height="auto"` inválido em SVG | A altura automática passa a ser obtida pela omissão do atributo |

Nas páginas do Aluno não houve overflow do documento em nenhum dos cinco viewports. Nas páginas CIEC, o conteúdo de tabela legado permanece largo, mas agora é contido pelo `main`, sem ampliar o documento.

## 4. Decisões sobre discrepâncias do Figma

1. **Texto secundário:** mantido `#737373` em vez de `#9F9F9F`. O valor adotado preserva a escala neutra do design e oferece contraste superior sobre branco.
2. **Sidebar recolhida:** mantida em 64 px em vez dos 45 px indicados pelo símbolo do Figma. A largura comporta alvo interativo de 40 px e padding sem comprometer a operação por ponteiro ou teclado.
3. **Responsividade sem frame de referência:** o Figma possui frames desktop, mas não define tablet/mobile. O drawer já existente foi preservado e o corte passou a incluir 1024 px, decisão aprovada durante a validação para acomodar o conteúdo administrativo real.

A separação entre tokens primitivos `--ldsa-*` e semânticos `--color-*` também foi mantida; componentes continuam consumindo apenas tokens semânticos.

## 5. Alterações por arquivo

- `src/components/layout/AppShell.jsx`: semântica modal condicional, `inert` no fundo, foco inicial no botão X, ciclo de Tab/Shift+Tab, fechamento por Escape e restauração de foco; overlay sem nome acessível duplicado.
- `src/components/layout/AppShell.module.css`: drawer em 1024 px inclusive e contenção horizontal do conteúdo legado no `main`.
- `src/components/layout/AppShell.test.jsx`: quatro regressões cobrindo rota atual/ARIA, abertura modal/foco/inert, Escape/restauração de foco e fechamento por navegação.
- `src/components/icons_Components/Icon_Logo_Comp.jsx`: omissão da altura quando automática.
- `src/components/image_Components/Mascote_Login_Comp.jsx`: omissão da altura quando automática.
- `.vscode/mcp.json`: configuração do MCP oficial do Figma versionada para padronizar o acesso da equipe; não contém token nem credencial.

## 6. Validação funcional autenticada

### CIEC

- Sidebar fixa e recolhível validada em desktop.
- Drawer validado em 1024, 768 e 390 px.
- Rota ativa indicada com `aria-current="page"`.
- Abertura, fechamento por overlay, fechamento por navegação e Escape aprovados.
- Alternância de tema aprovada.
- A tabela administrativa larga não causa mais overflow no documento.

### Aluno

- Todos os cinco viewports sem overflow do documento.
- Drawer com um único controle de fechamento acessível.
- Ao abrir, o foco vai para “Fechar menu de navegação”.
- Tab e Shift+Tab permanecem dentro do diálogo.
- Escape remove `inert` e devolve o foco a “Abrir menu de navegação”.
- Fechamento por navegação aprovado.

Resultado literal do teste final de teclado no navegador:

```text
{"opened":{"active":"Fechar menu de navegação","inside":true,"focusVisible":true},"back":"Sair","forward":"Fechar menu de navegação","closed":{"active":"Abrir menu de navegação","expanded":"false","inert":false}}
```

## 7. Saídas literais dos comandos

### `npm run lint`

```text
> ladesa-estagios@0.0.0 lint
> eslint .
```

### `npm test`

```text
> ladesa-estagios@0.0.0 test
> vitest run

 RUN  v4.1.11 /home/braga/Documentos/interns-webapp

 Test Files  7 passed (7)
      Tests  56 passed (56)
   Start at  12:21:03
   Duration  27.80s (transform 4.11s, setup 2.81s, import 5.26s, tests 3.89s, environment 12.87s)
```

### `npm run build`

```text
> ladesa-estagios@0.0.0 build
> vite build

vite v8.2.2 building client environment for production...
✓ 1835 modules transformed.
computing gzip size...
dist/index.html                         1.32 kB │ gzip:   0.65 kB
dist/assets/logo-BdS8ixGx.svg           9.57 kB │ gzip:   3.58 kB
dist/assets/informatica-Dccet4kc.png   48.51 kB
dist/assets/floresta-D1BeLk4l.png      86.60 kB
dist/assets/quimica-uwiqPNYU.png       93.01 kB
dist/assets/index-B-fZ4CSF.css         47.75 kB │ gzip:   9.93 kB
dist/assets/index-DGxR6Phf.js         364.71 kB │ gzip: 113.94 kB

✓ built in 6.96s
```

O build também informou que 92% do tempo foi gasto em hooks de plugins, principalmente no transform do `@rolldown/plugin-babel`; isso é diagnóstico de desempenho, não falha de compilação.

### `npm audit --omit=dev --audit-level=high`

```text
found 0 vulnerabilities
```

### `/home/braga/.local/bin/gitleaks dir . --config .gitleaks.toml --redact`

```text
    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

12:21PM INF scanned ~312616 bytes (312.62 KB) in 526ms
12:21PM INF no leaks found
```

### `git diff --check`

```text
```

O comando terminou com código zero e sem saída.

## 8. Itens fora do escopo

- Migração visual ou estrutural de login, dashboard e demais páginas.
- Criação de novos componentes de página.
- Extensão responsiva além do comportamento já existente no AppShell, exceto incluir o limite aprovado de 1024 px.
- Alteração da tabela CIEC; seu scroll interno continua sendo responsabilidade da futura migração da página.
- Alteração do modal de exclusão legado, que ainda precisa receber semântica de diálogo e gerenciamento de foco quando a página correspondente for migrada.
- Alterações em `src/utils/api.js`, `AuthContext`, rotas protegidas, DTOs, endpoints, autenticação ou autorização.

## 9. Recomendação

**A migração de login e dashboard pode começar.** O shell compartilhado passou pela validação autenticada nos perfis CIEC e Aluno, nos cinco viewports definidos, e o gate automatizado está integralmente aprovado.

A migração deve continuar incrementalmente. Ao tocar páginas CIEC com tabelas ou modais legados, os comportamentos responsivos e acessíveis desses elementos devem entrar no escopo específico da página, sem reabrir a fundação do AppShell.

# Relatório de Implementação do Design do Figma

## 1. Resumo executivo

Esta entrega estabelece a base visual e estrutural para alinhar gradualmente o frontend do sistema de Estágios do IFRO ao design oficial do Figma. Foram implementados tokens reutilizáveis, componentes visuais compartilhados, tema claro e escuro e um novo shell responsivo para os fluxos CIEC e Aluno.

O escopo executado corresponde às Fases 2, 3 e 4 do plano: tokens visuais, componentes reutilizáveis e layout/navegação. A adaptação individual das páginas permanece como etapa futura para evitar uma migração ampla sem validação incremental.

Nenhum endpoint, DTO, modo de autenticação, regra de autorização, cargo ou comportamento de persistência foi alterado.

## 2. Fontes analisadas

- Repositório local `ladesa-ro/interns-webapp`, branch `78-refactoring-the-desing-web`.
- Figma `ESTÁGIOS IFRO`, arquivo `c3RS790Fl3rr09qDLFF3bg`.
- Página `Sistema` (`0:1`), com frames de Login, CIEC, Aluno, modais e Empresa.
- Página `Componentes` (`2:2`), com paletas, tipografia, ícones e variações de sidebar.
- Estrutura atual de rotas, layouts, sidebars, estilos globais, formulários, tabelas e estados assíncronos.
- Documentação e implementação existentes de autenticação Bearer e do endpoint `/autenticacao/quem-sou-eu` foram preservadas, sem mudança contratual.

## 3. Diagnóstico visual do estado anterior

| Área | Estado anterior | Referência no Figma | Problema identificado | Direção adotada |
|---|---|---|---|---|
| Navegação | Sidebars CIEC e Aluno duplicadas, com links hardcoded | Sidebars aberta com 251 px e fechada com 45 px | Duplicação, estado ativo por comparação literal e ausência de drawer mobile | AppShell compartilhado com NavLink e drawer responsivo |
| Header | Inexistente no shell | Hierarquia consistente nas telas de 1330×720 | Sem área global para menu e ações | Header compartilhado com alternador de tema |
| Dashboard | Cards próprios e `div` clicável | Cards consistentes | Interação não acessível por teclado | Card reutilizável que vira `button` quando interativo |
| Formulários | Estilos repetidos por tela | Controles coerentes | Labels, erros e foco inconsistentes | Input, Select, Textarea e FieldWrapper compartilhados |
| Tabelas | Implementações distintas e estados próprios | Listagens CIEC | Estados assíncronos sem padrão | Estados reutilizáveis; migração das tabelas pendente |
| Cards | Três padrões distintos | Padrão visual recorrente | Raios, sombras e paddings divergentes | Card tokenizado |
| Responsividade | Fluxo administrativo sem media queries | Apenas desktop 1323/1330×720 | Overflow e navegação inadequada em telas estreitas | Drawer abaixo de 1024 px e conteúdo responsivo |
| Acessibilidade | Foco e semântica inconsistentes | Não documentada em detalhe | Botões sem nome, cards não focáveis e ausência de skip-link | Foco visível, skip-link, ARIA e focus trap |

Antes desta entrega existiam 282 ocorrências de cores hexadecimais hardcoded em 30 arquivos CSS, 369 valores diretos de tipografia/espaçamento/raio e somente dois tokens globais de fonte.

## 4. Decisões de design

- `Paleta - White Mode` e `Paleta - Dark Mode` são as fontes semânticas principais.
- `Paleta De Cores` complementa os temas com escalas de verde, neutros, erro, informação e aviso.
- Poppins é usada em títulos; Inter, no corpo de texto.
- Tokens são divididos entre primitivos (`--ldsa-*`) e semânticos (`--color-*`). Componentes consomem a camada semântica.
- O tema escuro é funcional, persiste em `localStorage` e respeita `prefers-color-scheme` na primeira visita.
- Como não há frames mobile/tablet no Figma, o comportamento responsivo foi projetado a partir das necessidades funcionais e registrado como diferença consciente.
- Foram mantidos os componentes legados durante a migração gradual, evitando quebra ampla de páginas.

## 5. Alterações implementadas

- Criação de `src/styles/tokens.css` com tokens light/dark, tipografia, espaçamento, raios, sombras, camadas e dimensões.
- Criação de `src/styles/design-system.css` com reset conservador, foco visível, skip-link, utilitário de leitor de tela e `prefers-reduced-motion`.
- Importação da base visual antes dos estilos legados.
- Criação da biblioteca em `src/components/ui`.
- Criação de `ThemeContext` para seleção e persistência do tema.
- Criação de `AppShell` compartilhado pelos layouts CIEC e Aluno.
- Migração dos wrappers `Layout` e `LayoutAluno` para o novo shell, mantendo todas as rotas.

## 6. Componentes e tokens criados

### Componentes

- `Button`: variantes, tamanhos, loading, disabled e `aria-busy`.
- `Input`, `Select` e `Textarea`: label, dica, erro, `aria-invalid` e `aria-describedby`.
- `Card`: apresentação ou interação semântica por `button`.
- `Badge`: tons neutro, sucesso, erro, aviso e informação.
- `Modal`: portal, focus trap, Escape, retorno de foco, scroll lock e atributos ARIA.
- `ConfirmDialog`: confirmação/cancelamento com estado de processamento.
- `PageContainer` e `PageHeader`: estrutura de página e breadcrumbs.
- `LoadingState`, `EmptyState` e `ErrorState`: estados assíncronos consistentes.

### Tokens

- Verde `g1–g9`: `#035611` a `#82F494`; marca principal `g5`, `#2F9E41`.
- Neutros `c1–c14`: `#121212` a `#FAFAFA`.
- Erro `r1–r6`, informação `b1–b6` e aviso `y1–y6`.
- Tema claro: marca `#2F9E41`, fundo `#FFFFFF`, texto `#050F07`, perigo `#CD191E`.
- Tema escuro: marca `#066436`, fundo `#191B22`, texto `#D4DEDE`, perigo `#A00F25`.
- Escala de espaçamento baseada em 4 px, raios de 4/8/12 px e sombras semânticas.

## 7. Telas adaptadas

Nesta etapa, os wrappers de todos os caminhos autenticados foram adaptados:

- Fluxo CIEC: painel, empresas, vagas, lista de espera, perfil, alunos e relatórios passam pelo novo AppShell.
- Fluxo Aluno: início, perfil, lista de espera, guia de estágio, contato, avaliação, folha de pontos e solicitação passam pelo mesmo shell.
- Login permanece funcional e visualmente preservado, aguardando sua migração específica na Fase 5.

O conteúdo interno dessas páginas ainda usa majoritariamente CSS e componentes legados. Isso é intencional e reduz o risco da migração.

## 8. Responsividade

- Sidebar fixa/recolhível em desktop.
- Sidebar transformada em drawer sobreposto abaixo de 1024 px.
- Drawer com overlay, fechamento por Escape, botão de fechar e fechamento ao navegar.
- Margem do conteúdo acompanha a largura da sidebar no desktop e é removida em tablet/mobile.
- Header e containers reduzem padding e tipografia abaixo de 768 px.
- Breakpoints documentados para 390, 768, 1024, 1280 e 1440 px.

As tabelas e grades internas ainda precisam de ajustes por página na Fase 5/6.

## 9. Acessibilidade

- Foco visível global com contraste e offset.
- Skip-link para o conteúdo principal.
- Navegação semântica e indicação de página ativa via `NavLink`/`aria-current`.
- Botões de menu com `aria-expanded`, `aria-controls` e nomes acessíveis.
- Alternador de tema com `aria-pressed` e rótulo dinâmico.
- Card interativo renderizado como `button`.
- Modais com `role="dialog"`, `aria-modal`, rótulo, descrição, focus trap, Escape e restauração de foco.
- Formulários compartilhados com associação correta entre label, dica, erro e controle.
- Estados de loading com `role="status"` e regiões de erro com `role="alert"`.
- Respeito a `prefers-reduced-motion`.

## 10. Preservação da integração com a API

Não houve alteração em:

- `src/utils/api.js`;
- `AuthContext` e seus endpoints;
- modo Bearer atual;
- `VITE_AUTH_MODE`;
- rotas protegidas e perfis exigidos;
- payloads, DTOs ou endpoints de formulários;
- regras de autorização ou persistência.

O `ThemeContext` é independente do contexto de autenticação e armazena apenas a preferência visual `ladesa-tema`.

## 11. Validações executadas

- `npm run lint`: aprovado.
- `npm test`: 6 arquivos e 52 testes aprovados.
- `npm run build`: aprovado; 1.835 módulos transformados.
- `npm audit --omit=dev --audit-level=high`: 0 vulnerabilidades.
- `gitleaks dir . --config .gitleaks.toml --redact`: nenhum vazamento encontrado.
- `git diff --check`: aprovado antes de cada commit.
- Inspeção visual do login em `http://localhost:5173/login`: sem regressão aparente.

## 12. Diferenças entre Figma e implementação

- O Figma contém apenas frames desktop (1323/1330×720). Tablet e mobile foram projetados responsivamente com sidebar em drawer, sem referência visual equivalente.
- O Figma define `#9F9F9F` para texto secundário sobre branco, com contraste aproximado de 2,5:1. A implementação usa `c6` (`#737373`) para texto secundário, preservando a paleta e melhorando a conformidade WCAG.
- O verde `#2F9E41` com texto branco oferece aproximadamente 3,2:1. Para botões e texto que exigem contraste maior, foi criado `--color-brand-strong` com `g3` (`#157D26`).
- A largura recolhida foi implementada como 64 px, em vez dos 45 px do símbolo no Figma, para comportar alvo interativo de 40 px mais padding e preservar ergonomia.
- Ícones do projeto e `lucide-react` foram reutilizados; nenhum SVG do Figma foi copiado arbitrariamente.
- As páginas internas ainda não foram visualmente migradas para os novos componentes.

## 13. Pendências

- Migrar login, painel, empresas e vagas para os componentes compartilhados.
- Migrar cadastros/edições, perfil, telas do aluno e relatórios.
- Padronizar tabelas com caption, cabeçalhos semânticos, scroll mobile e estados compartilhados.
- Aplicar tokens semânticos aos 30 arquivos CSS legados e reduzir cores hardcoded.
- Validar visualmente áreas autenticadas em 1440, 1280, 1024, 768 e 390 px com sessão de teste autorizada.
- Remover `Sidebar.jsx`, `SidebarAluno.jsx` e estilos globais associados somente após concluir a migração.
- Avaliar o aviso existente de SVG com `height="auto"` emitido pelo navegador; não foi introduzido nesta entrega.
- Decidir se `.vscode/mcp.json`, atualmente fora dos commits, deve ser versionado para facilitar o acesso da equipe ao Figma MCP.

## 14. Conclusão

A aplicação agora possui uma fundação visual coerente com o Figma, temas claros e escuros reais, componentes acessíveis e um shell responsivo compartilhado. A estratégia incremental preservou comportamento, integração e permissões existentes. A próxima entrega deve aplicar essa base às páginas prioritárias e validar os fluxos autenticados visualmente.

### Commits locais

- `52f13cb feat(ui): add design tokens extracted from Figma`
- `fb7ee97 feat(ui): add base component library`
- `59532cd refactor(layout): add responsive AppShell with theme switching`
- `fb90b94 test(ui): cover keyboard and ARIA behavior`

### Sugestão de próximo commit

`style(pages): align login and dashboard with Figma`

### Sugestão de descrição da Pull Request

Esta PR inicia o alinhamento do frontend ao design oficial do Figma. Introduz tokens light/dark, componentes UI acessíveis e um AppShell responsivo compartilhado pelos fluxos CIEC e Aluno. Mantém os contratos da API, autenticação Bearer, rotas e perfis existentes. A migração visual das páginas será realizada gradualmente em commits posteriores, começando por login e painel.

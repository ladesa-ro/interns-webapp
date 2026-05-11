# Sistema de Gerenciamento de Estágios — IFRO Campus Ji-Paraná

Aplicação web desenvolvida para apoiar o acompanhamento de estágios no **IFRO Campus Ji-Paraná**, com foco no suporte às rotinas da CIEC (Coordenação de Integração Escola, Empresa e Comunidade).

## Objetivo

Centralizar, em uma interface simples e visual, informações importantes sobre:

- empresas cadastradas;
- vagas disponíveis;
- alunos em estágio;
- alunos em lista de espera;
- alertas e pendências.

## Funcionalidades atuais

- **Painel principal** com indicadores de estágio e alertas.
- **Listagem de empresas cadastradas** com dados de curso e contato.
- **Navegação por menu lateral** entre as áreas do sistema.
- Telas iniciais para:
  - cadastro de vaga;
  - lista de espera;
  - perfil.


## Tecnologias utilizadas

- **React**
- **Vite**
- **React Router DOM**
- **Lucide React** (ícones)
- **CSS**

## Estrutura do projeto

O código da aplicação está na raiz do repositório.

Principais diretórios:

- `src/components`: componentes reutilizáveis (ex.: layout e sidebar);
- `src/pages`: páginas da aplicação (painel, empresas, vagas, etc.);
- `public`: arquivos estáticos.

## Como executar localmente

### Pré-requisitos

- Node.js 18+ (recomendado)
- npm

### Passos

1. Clone este repositório.
2. Instale as dependências:

	```bash
	npm install
	```

3. Execute em modo de desenvolvimento:

	```bash
	npm run dev
	```

4. Abra o endereço exibido no terminal (normalmente `http://localhost:5173`).

## Scripts disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento;
- `npm run build` — gera a versão de produção;
- `npm run preview` — visualiza o build localmente;
- `npm run lint` — executa a análise de lint.

## Público-alvo

- Coordenação CIEC;
- equipe administrativa ligada ao estágio;
- comunidade acadêmica do IFRO Campus Ji-Paraná e outros campi.

## Próximos passos (sugestão)

- integração com API/backend;
- autenticação de usuários;
- cadastro completo de empresas e vagas com persistência;
- filtros e busca por curso/turma;
- geração de relatórios e exportação.

## Licença

Este projeto segue a licença definida no repositório.

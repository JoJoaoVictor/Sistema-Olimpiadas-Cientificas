# Frontend — Sistema de Olimpíadas de Matemática (UNEMAT)

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Router-v6-CA4245?style=flat&logo=reactrouter&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat" />
  <img src="https://img.shields.io/badge/CSS_Modules-✓-blue?style=flat" />
  <img src="https://img.shields.io/badge/status-em%20desenvolvimento-orange?style=flat" />
</p>

Interface web desenvolvida em **React 18 + Vite** para gestão completa das Olimpíadas de Matemática da UNEMAT. Permite cadastro e revisão de questões com suporte a **LaTeX**, montagem de provas, geração de PDF e controle de acesso por perfil de usuário.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Autenticação e Controle de Acesso](#autenticação-e-controle-de-acesso)
- [Papéis e Permissões por Tela](#papéis-e-permissões-por-tela)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [Componentes Principais](#componentes-principais)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Boas Práticas Aplicadas](#boas-práticas-aplicadas)
- [Deploy em Produção](#deploy-em-produção)

---

## Funcionalidades

### Autenticação
- Login com e-mail/senha e **Google OAuth** (Google Identity Services)
- Controle de sessão via **JWT** (access token + refresh token)
- Proteção de rotas por papel via `PrivateRoute` com redirecionamento para `/nao-autorizado`
- Logout com limpeza completa de estado e contexto
- Criação e alteração de senha para usuários Google (que não possuem senha local)
- Recuperação de senha por e-mail com token temporário

### Banco de Questões
- Cadastro completo de questões com enunciado, alternativas A–E e resolução detalhada
- Suporte a **LaTeX** com pré-visualização em tempo real (KaTeX)
- Seletor visual de alternativa correta (botões circulares A/B/C/D/E)
- Upload de imagem por questão com processamento automático
- Classificação **BNCC** em cascata: série → unidade temática → objeto do conhecimento → habilidade
- Filtros avançados: nome, dificuldade, habilidade BNCC, unidade temática, ano escolar, data
- Alternância de visualização entre grade e lista
- Fluxo de revisão visível pelo autor (comentários do revisor destacados com alerta)

### Edição de Questão
- Formulário completo de edição com todos os campos BNCC
- Visualização detalhada com renderização LaTeX das alternativas
- Campo de revisão e comentários do revisor (visível apenas para perfis autorizados)
- Tela de "Acesso não permitido" com feedback visual ao tentar acessar questão de outro usuário

### Montagem e Gestão de Provas
- Listagem de provas com filtros por nome, data, anos escolares, fase e status
- Edição de metadados: nome, ano, fase, status e anos escolares
- Gerenciamento de questões da prova: adicionar, remover e reordenar
- Configuração de cabeçalho e rodapé customizados (upload de imagem + controle de tamanho %)
- Geração de PDF diretamente pelo navegador (abre em nova aba)
- Exclusão de prova com confirmação

### Sistema de Notificações
- Sino de notificações no Navbar com **badge de contagem** de não lidas
- Dropdown com lista de notificações ordenadas (não lidas primeiro)
- Clique na notificação navega diretamente para a questão ou prova correspondente
- Marcar como lida individualmente ou todas de uma vez
- Atualização automática via **polling** (a cada 30 segundos)

### Perfil do Usuário
- Visualização de dados da conta (nome, e-mail, cargo, data de cadastro)
- Edição de nome e URL de avatar com pré-visualização
- Criação ou alteração de senha (fluxo diferenciado para usuários Google)
- Logout com limpeza de sessão

---

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 18 | Interface e gerenciamento de estado |
| **Vite** | 5 | Bundler e servidor de desenvolvimento |
| **React Router** | v6 | Navegação e proteção de rotas |
| **Axios** | 1.x | Requisições HTTP com interceptores JWT |
| **React Select** | 5.x | Selects avançados com multi-seleção |
| **KaTeX** | 0.16+ | Renderização de LaTeX no browser |
| **react-icons** | 5.x | Biblioteca de ícones (Fa, Fi, Bs, Lu) |
| **CSS Modules** | — | Estilização isolada por componente |
| **Google Identity Services** | — | Login social OAuth2 |

---

## Pré-requisitos

| Componente | Versão mínima |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Backend rodando | http://localhost:8000 |

---

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/JoJoaoVictor/Frontend-Olimpiadas-Matematica.git
cd Frontend-Olimpiadas-Matematica
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
# Disponível em http://localhost:5173
```

### Outros comandos

```bash
npm run build       # Gera build de produção em dist/
npm run preview     # Pré-visualiza o build localmente
npm run lint        # Executa ESLint
```

---

## Estrutura de Diretórios

```
src/
├── App.jsx                        # Rotas principais e AppContent
├── main.jsx                       # Ponto de entrada React
├── index.css                      # Estilos globais
│
├── components/
│   │
│   ├── Layout/                    # Estrutura global da aplicação
│   │   ├── Container.jsx          # Layout base com Navbar + conteúdo
│   │   ├── Navbar.jsx             # Barra de navegação com sino de notificações
│   │   ├── Footer.jsx
│   │   ├── Loading.jsx
│   │   ├── LinkButton.jsx
│   │   └── ScrollToTop.jsx
│   │
│   ├── form/                      # Componentes de formulário reutilizáveis
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── SubmitButton.jsx
│   │   ├── SearchBar.jsx
│   │   └── ImageUploader.jsx
│   │
│   ├── Routes/
│   │   └── PrivateRoute.jsx       # Guard de rota por papel (lê AuthContext)
│   │
│   └── pages/
│       │
│       ├── Home/                  # Página inicial com carousel
│       │
│       ├── Usuario/               # Perfil do usuário logado
│       │   ├── Usuario.jsx
│       │   └── Componentes/
│       │       ├── EditarPerfil.jsx
│       │       └── AlterarSenha.jsx
│       │
│       ├── Project_Page/          # Banco de questões
│       │   ├── Projects.jsx       # Listagem com filtros avançados
│       │   ├── NewProject.jsx     # Criação de questão
│       │   ├── Project_Forme/
│       │   │   └── ProjectForme.jsx   # Formulário de questão (BNCC + LaTeX)
│       │   └── Components_project/
│       │       ├── LatexText.jsx      # Renderizador KaTeX
│       │       ├── Project_Card/      # Card de questão (grid)
│       │       ├── Project_List/      # Item de questão (lista)
│       │       └── Project_Modals/
│       │           └── Projetos.jsx   # Visualização/edição de questão
│       │
│       ├── Provas/                # Gestão de provas
│       │   ├── Prova.jsx          # Listagem de provas com filtros
│       │   └── Prova_Modal/
│       │       ├── EditarProva.jsx    # Edição completa de prova
│       │       ├── components/
│       │       │   ├── QuestaoCard.jsx
│       │       │   ├── ModalAdicionarQuestao.jsx
│       │       │   └── TabCabecalhoRodape.jsx
│       │       └── hooks/
│       │           └── useEditarProva.js  # Toda lógica de estado da edição
│       │
│       ├── ConfProvas/            # Montagem livre de provas
│       │   ├── MontarProva.jsx
│       │   └── modal/
│       │       ├── ModalInfoQuestao.jsx
│       │       └── ModalSalvarProva.jsx
│       │
│       ├── Admin/
│       │   └── AdminUsers.jsx     # Gerenciamento de usuários (Admin)
│       │
│       └── Altorizacao/
│           └── Unauthorized.jsx   # Tela de acesso não permitido
│
├── contexts/
│   └── auth.jsx                   # AuthContext — signed, user, role, userId, hasRole()
│
├── hooks/
│   ├── useAuth.jsx                # Consome AuthContext
│   └── usePermission.jsx          # isAdmin, isRevisor, isProfessor, canEdit, canReview...
│
├── services/
│   ├── api.js                     # Instância Axios com interceptor de token e refresh
│   └── authService.jsx            # login, register, logout, getUser, getToken...
│
└── data/
    ├── bncc_matematica.json       # Base de dados BNCC local
    └── bnccHelper.js              # getTemasByGrauId, getObjetosByTema, getHabilidadesByObjeto
```

---

## Autenticação e Controle de Acesso

### Contexto de Autenticação (`AuthContext`)

Todos os dados de sessão são gerenciados centralizadamente pelo `AuthContext` em `src/contexts/auth.jsx`. Ele expõe:

```js
const { signed, user, role, userId, hasRole, login, registro, signout } = useContext(AuthContext)
```

**Nunca leia o `localStorage` diretamente nos componentes.** Use sempre `usePermission()` ou `useAuth()`.

### Hook `usePermission`

```js
const {
  isAdmin,      // role === ADMIN
  isRevisor,    // role === REVISOR ou ADMIN
  isProfessor,  // role === PROFESSOR ou ADMIN
  isEstudante,  // role === STUDENT
  canEdit,      // pode editar questões
  canReview,    // pode aprovar/reprovar questões
  userId,
  role,
} = usePermission()
```

### `PrivateRoute`

Lê `role` do `AuthContext` (reativo). Ao trocar de conta, o guard atualiza imediatamente sem necessidade de reload.

```jsx
// Uso no App.jsx
<PrivateRoute allowedRoles={['ADMIN']}>
  <AdminUsers />
</PrivateRoute>
```

---

## Papéis e Permissões por Tela

| Tela | STUDENT | PROFESSOR | REVISOR | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Home | ✅ | ✅ | ✅ | ✅ |
| Banco de Questões (pendentes) | Só as próprias | Todas | Todas | Todas |
| Banco de Questões (aprovadas) | Só as próprias | Todas | Só as que aprovou | Todas |
| Criar questão | ✅ | ✅ | ✅ | ✅ |
| Editar questão | Só a própria (pendente) | Só a própria | Qualquer | Qualquer |
| Campo de revisão/comentário | ✗ | ✗ | ✅ | ✅ |
| Provas | ✗ | ✅ | ✅ | ✅ |
| Montar prova | ✗ | ✅ | ✅ | ✅ |
| Painel Admin | ✗ | ✗ | ✗ | ✅ |
| Perfil | ✅ | ✅ | ✅ | ✅ |

---

## Rotas da Aplicação

| Rota | Componente | Roles permitidos |
|---|---|---|
| `/` | `Home` | Todos autenticados |
| `/login` | `Login` | Público |
| `/register` | `Registro` | Público |
| `/forgot-password` | `ForgotPassword` | Público |
| `/reset-password` | `ResetPassword` | Público |
| `/nao-autorizado` | `Unauthorized` | Público |
| `/usuario` | `Usuario` | Todos autenticados |
| `/projects` | `Projects` | Todos autenticados |
| `/newproject` | `NewProject` | Todos autenticados |
| `/projetos/:id` | `Projetos` | Todos autenticados |
| `/provas` | `Prova` | PROFESSOR, REVISOR, ADMIN |
| `/provas/:id` | `EditarProva` | PROFESSOR, REVISOR, ADMIN |
| `/montarprova` | `MontarProva` | PROFESSOR, REVISOR, ADMIN |
| `/admin` | `AdminUsers` | ADMIN |

---

## Componentes Principais

### `ProjectForme`
Formulário completo de criação/edição de questão. Destaques:
- Seleção BNCC em cascata (grau → tema → objeto → habilidade) com dados locais do `bncc_matematica.json`
- Cards individuais por alternativa com pré-visualização LaTeX inline
- Seletor visual da alternativa correta (botões circulares — elimina erros de digitação)
- Campo de resolução com fundo amarelo para diferenciação visual
- `text=" "` nos inputs sem label para satisfazer PropTypes sem exibir `:`

### `useEditarProva` (hook)
Centraliza toda a lógica da tela de edição de prova:
- Busca, salvamento e cancelamento de edição de metadados
- Remoção, adição e reordenação de questões (com chamada ao backend)
- Geração de PDF (abre blob em nova aba)
- Upload e remoção de cabeçalho/rodapé customizados
- Exclusão de prova com confirmação

### `PrivateRoute`
Guard reativo que lê `role` do `AuthContext`. Trata o estado `loading=true` (hidratação inicial no F5) retornando `null` para evitar redirect falso para `/login`.

### `api.js` (Axios)
Instância centralizada com:
- `baseURL` via `VITE_API_URL`
- Interceptor de request: injeta `Authorization: Bearer <token>` automaticamente
- Interceptor de response: em caso de 401, tenta refresh automático do token antes de fazer logout

---

## Variáveis de Ambiente

```env
# URL base da API backend
VITE_API_URL=http://localhost:8000

# Client ID do Google OAuth (Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

> As variáveis prefixadas com `VITE_` são expostas ao bundle pelo Vite. Nunca coloque segredos nelas.

---

## Boas Práticas Aplicadas

### Google Translate — Prevenção de crash do DOM
Componentes que misturam ícones React com texto são vulneráveis ao Google Translate, que insere tags `<font>` no DOM e quebra o reconciliador do React (`insertBefore` / `removeChild` crash). A solução aplicada:

```jsx
// Em qualquer elemento com ícone + texto
<header translate="no">
  <FaEdit /> Editar Questão
</header>

// Em todos os react-select
<div className="notranslate" translate="no">
  <Select instanceId="id-fixo" ... />
</div>
```

### Leitura de role — sempre pelo contexto
```jsx
// ✅ Correto
const { isRevisor } = usePermission()

// ❌ Errado — não sincroniza ao trocar de conta
const data = JSON.parse(localStorage.getItem('user_token'))
```

### Requisições HTTP — sempre pelo serviço centralizado
```jsx
// ✅ Correto — token injetado automaticamente
import api from '../services/api'
await api.put('/api/v1/users/me', payload)

// ❌ Errado — URL hardcoded e token manual
fetch('http://127.0.0.1:5000/api/v1/users/change-password', { headers: ... })
```

---

## Deploy em Produção

```bash
# 1. Configurar variável da API de produção
echo "VITE_API_URL=https://olimpiadas.instituicao.edu.br" > .env.production

# 2. Gerar build otimizado
npm run build
# Output em dist/

# 3. Enviar para o servidor
rsync -avz dist/ usuario@servidor:/var/www/olimpiadas/frontend/
```

O Nginx serve a pasta `dist/` com `try_files $uri /index.html` para suportar o roteamento do React Router. Consulte o **[Guia Técnico de Deploy](../backend/docs/deploy_guide.docx)** para a configuração completa do Nginx.

---

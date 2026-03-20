# Sistema de Olimpíadas de Matemática — UNEMAT

Plataforma web completa para gerenciamento de questões e montagem de provas das Olimpíadas de Matemática da UNEMAT. Permite cadastro de questões com LaTeX, montagem de provas por fase e ano escolar, geração de PDF com gabarito e controle de status por perfil de usuário.

---

## Funcionalidades

### Autenticação
- Login com e-mail/senha e Google OAuth
- Perfis de acesso: **Administrador** e **Professor**
- Controle de permissões por rota e por ação

### Banco de Questões
- Cadastro de questões com enunciado em LaTeX, alternativas e resolução detalhada
- Upload de imagem por questão com papel semântico (pequena, média, grande)
- Categorização por grau (Fundamental I, Fundamental II, Ensino Médio)
- Campos BNCC: unidade temática, código de habilidade, objetos de conhecimento
- Fluxo de aprovação: Pendente → Em Revisão → Aprovada / Rejeitada
- Filtros por nome, dificuldade, habilidade, tema, ano e nível de categoria

### Montagem de Provas
- Seleção e ordenação de questões aprovadas
- Configuração de nome, fase, anos escolares e status da prova
- Edição completa: adicionar/remover questões, reordenar, alterar metadados
- Modal de detalhes da questão com renderização LaTeX antes de adicionar
- Controle de status: PENDENTE, APLICADA, APROVADA

### Geração de PDF
- PDF gerado no servidor via **Playwright + MathJax SVG**
- Layout em duas colunas com cabeçalho e rodapé institucionais
- Duas versões em um único PDF: prova limpa + gabarito com resolução destacada
- Cabeçalho e rodapé customizáveis por prova (upload de imagem + controle de tamanho)
- Título automático no padrão: `OLIMPÍADA DE MATEMÁTICA DA UNEMAT – 2024 – 3ª FASE – 4° e 5° Anos`

### Gerenciamento de Provas
- Listagem com filtros por nome, data de criação, anos, fase e status
- Visualização e edição completa de prova salva
- Exclusão de prova com confirmação (bloqueia provas com status APLICADA)
- Campo de ano editável pelo usuário

---

## Stack Tecnológica

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 18** | Interface |
| **Vite** | Bundler |
| **React Router v6** | Navegação |
| **Axios** | Requisições HTTP |
| **React Select** | Selects avançados |
| **KaTeX** | Renderização de LaTeX no browser |
| **react-icons** | Ícones |
| **CSS Modules** | Estilização por componente |

### Backend
| Tecnologia | Uso |
|---|---|
| **FastAPI** | API REST |
| **SQLAlchemy** | ORM |
| **SQLite** | Banco de dados (desenvolvimento) |
| **Pydantic v2** | Validação de schemas |
| **Playwright** | Geração de PDF via browser headless |
| **MathJax 3** | Renderização de LaTeX no PDF |
| **Pillow** | Processamento de imagens de layout |
| **PyPDF2** | Pós-processamento do PDF (remoção de páginas em branco) |
| **Google OAuth** | Autenticação social |

---

## Estrutura do Projeto

```
├── frontend/                  # Aplicação React (Vite)
│   └── src/
│       ├── components/
│       │   ├── pages/
│       │   │   ├── Provas/           # Listagem e edição de provas
│       │   │   │   └── Prova_Modal/  # EditarProva + hooks + componentes
│       │   │   └── Project_Page/     # Edição de questões
│       │   └── ConfProvas/           # MontarProva (montagem livre)
│       └── services/          # api.js, authService.jsx
│
└── backend/                   # API FastAPI
    ├── app/
    │   ├── api/v1/            # Rotas (exams, questions, users...)
    │   ├── models/            # SQLAlchemy models
    │   ├── schemas/           # Pydantic schemas
    │   ├── services/          # Lógica de negócio
    │   └── utils/             # pdf_generator.py, playwright_manager.py
    ├── static/img/            # Cabeçalho e rodapé padrão (heder.PNG, footer.PNG)
    ├── uploads/
    │   ├── images/            # Imagens das questões
    │   └── layouts/           # Cabeçalhos/rodapés customizados por prova
    └── scripts/               # Migrations e seeds
```

---

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- Playwright instalado (`playwright install chromium`)

### Frontend

```bash
cd frontend
npm install
npm run dev
# Disponível em http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements/base.txt
playwright install chromium

# Popular banco com dados iniciais
python scripts/seed_database.py

# Iniciar servidor
python run.py
# Disponível em http://localhost:8000
```

### Migrations (executar uma vez após atualizar o código)

```bash
python scripts/add_exam_layout_columns.py
python scripts/add_exam_ano_column.py
```

---

## Credenciais de Acesso (ambiente de desenvolvimento)

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@olimpiadas.com | Admin@123456 |
| Professor | professor@olimpiadas.com | Prof@123456 |

---

## Documentação da API

Com o servidor rodando, acesse:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Em Desenvolvimento

- Painel de estatísticas por questão e por prova
- Exportação do banco de questões em PDF
- Relatório de desempenho por fase
- Suporte a múltiplas instituições

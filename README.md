# Sistema-Olimp-adas-de-Matem-tica
Plataforma web para montagem de provas de matemática com questões categorizadas e suporte a geração de PDF. Desenvolvido em React com foco em usabilidade para professores.
## 🚀 Funcionalidades

- ✅ Cadastro e autenticação de usuários (com Google OAuth)
- 🔎 Filtro de questões por nome, dificuldade, habilidade, objeto de conhecimento e unidade temática
- 🧮 Suporte a fórmulas matemáticas com LaTeX
- 🗃️ Banco de dados com questões aprovadas e pendentes
- 🧩 Montagem de provas com seleção de questões na ordem desejada
- 🖨️ Geração de provas organizadas em PDF
- 📦 Integração com uma API local (JSON Server ou backend real)
- 💡 Interface intuitiva e responsiva feita em React

## 🛠️ Tecnologias Utilizadas

- **React** (v18+)
- **Node.js**
- **Supabase** (para autenticação e banco, se aplicável)
- **@react-oauth/google**
- **JSON Server** (para simulação de API REST)
- **LaTeX** (para renderização de fórmulas matemáticas)
- **jsPDF** + **html2canvas** (para geração de PDF)

🧪 Em Desenvolvimento
🔐 Sistema de permissões por tipo de usuário (ex: professor/aluno)

📊 Estatísticas de desempenho por questão

🧱 Interface administrativa para aprovação de questões

🧭 Organização por áreas da matemática e fase escola

  ## Instale as Dependencias caso ja tenho Node.js instalado 
    ``````
      npm install
    ``````
  ## Inicie o servidor JSON local para testes
    ``````
      npx json-server --watch db.json --port 5000
    ``````
  ## Rode a aplicação
    ``````
      npm run dev
    ``````

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { authService } from './services/authService';

/* Pages */
import Home from './components/pages/Home/Home.jsx';
import NewProject from './components/pages/Project_Page/NewProject.jsx';
import Project from './components/pages/Project_Page/Projects.jsx';
import Usuario from './components/pages/Usuario/Usuario.jsx';
import AdminUsers from './components/pages/Admin/AdminUsers.jsx';
import ForgotPassword from './components/pages/Usuario/Componentes/Login/ForgotPassword.jsx';
import ResetPassword from './components/pages/Usuario/Componentes/Login/ResetPassword.jsx';
import Login from './components/pages/Usuario/Componentes/Login/Login.jsx';
import Register from './components/pages/Usuario/Componentes/Login/Registro.jsx';
import Projetos from './components/pages/Project_Page/Components_project/Project_Modals/Projetos.jsx'; // Detalhes da questão
import MontarProva from './components/ConfProvas/MontarProva.jsx';
import Prova from './components/pages/Provas/Prova';

/* Layout */ 
import Container from './components/Layout/Container.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import ScrollToTop from "./components/Layout/ScrollToTop.jsx"

/* Swiper */ 
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

/**
 * ==========================================================
 * COMPONENTE: PÁGINA DE ACESSO NEGADO
 * Aparece quando o usuário tenta acessar uma rota que o perfil dele não permite.
 * Ex: Um Estagiário tentando entrar na tela de Montar Prova.
 * ==========================================================
 */
const Unauthorized = () => (
  <div style={{ textAlign: "center", padding: "50px", color: "#777" }}>
    <h1>🚫 Acesso Restrito</h1>
    <p>Você não tem permissão para acessar esta funcionalidade.</p>
    <a href="/" style={{ color: "#222", fontWeight: "bold" }}>Voltar ao Início</a>
  </div>
);

/**
 * ==========================================================
 * COMPONENTE: GUARDA DE ROTAS (PrivateRoute)
 * O "Segurança" do sistema. Ele verifica:
 * 1. O usuário está logado? (Se não, manda pro Login)
 * 2. O usuário tem o cargo (role) necessário? (Se não, manda pro Unauthorized)
 * ==========================================================
 */
const PrivateRoute = ({ allowedRoles }) => {
  const isLogged = authService.isAuthenticated();
  const user = authService.getUser();

  // 1. Verificação de Login
  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verificação de Perfil (Role)
  // Se a rota exige papéis específicos (allowedRoles) e o usuário não tem um deles...
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Tudo certo: Renderiza a página solicitada
  return <Outlet />;
};

function App() {

  return (
    <Router>
      <ScrollToTop />
      {/* Navbar inteligente: exibe apenas os botões permitidos para o perfil */}
      <Navbar /> 
      
      <Container customClass="min-height">
        <Routes>
          
          {/* ====================================================
              1. ROTAS PÚBLICAS (Qualquer pessoa acessa)
             ==================================================== */}
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ====================================================
              2. ROTAS COMUNS (Acessíveis a todos os usuários logados)
             ==================================================== */}
          <Route element={<PrivateRoute />}>
            <Route path="/usuario" element={<Usuario />} />
          </Route>

          {/* ====================================================
              3. ÁREA DE QUESTÕES (BANCO DE DADOS)
              - STUDENT: Cria as questões (trabalho dele).
              - PROFESSOR: Consulta as questões para usar.
              - REVISOR: Revisa as questões criadas.
             ==================================================== */}
          <Route element={<PrivateRoute allowedRoles={['STUDENT', 'PROFESSOR', 'ADMIN', 'REVISOR']} />}>
            <Route path="/newproject" element={<NewProject/>} />      {/* Formulário de criação */}
            <Route path="/projects" element={<Project />} />          {/* Lista de todas as questões */}
            <Route path="/projetos/:id" element={<Projetos />} />     {/* Detalhes/Edição da questão */}
          </Route>

          {/* ====================================================
              4. ÁREA DE PROVAS (SIGILOSA)
              - STUDENT (Estagiário) É BARRADO AQUI. Ele não pode ver provas.
              - PROFESSOR: Monta as provas.
              - REVISOR: Confere se a prova está correta.
             ==================================================== */}
          <Route element={<PrivateRoute allowedRoles={['PROFESSOR', 'ADMIN', 'REVISOR']} />}>
            <Route path="/montarProva" element={<MontarProva/>} />    {/* Ferramenta de criar prova */}
            <Route path="/Prova" element={<Prova/>} />                {/* Banco de provas prontas */}
          </Route>

            {/* ====================================================
              5. ÁREA DO ADMINISTRADOR (SISTEMA)
            ==================================================== */}
          <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
            {/* O admin pode ver tudo, mas essa rota é EXCLUSIVA dele */}
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          {/* Rota Coringa (404) - Redireciona para login ou home */}
          <Route path="/*" element={<Navigate to="/login" />} />

        </Routes>
      </Container>
      
      <ConditionalFooter />
    </Router>
  );
}

// Footer só aparece na Home para não poluir telas de formulário
function ConditionalFooter() {
  const location = useLocation();
  return location.pathname === "/" ? <Footer /> : null;
}

export default App;
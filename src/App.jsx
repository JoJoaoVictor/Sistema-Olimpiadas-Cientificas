import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { authService } from './services/authService';
import PrivateRoute from './components/Routes/PrivateRoute.jsx';

/* Pages */
import Home from './components/pages/Home/Home.jsx';
import NewProject from './components/pages/Project_Page/NewProject.jsx';
import Project from './components/pages/Project_Page/Projects.jsx';
import Usuario from './components/pages/Usuario/Usuario.jsx';
import AdminUsers from './components/pages/Admin/AdminUsers.jsx';
import ForgotPassword from './components/pages/Usuario/Componentes/Login/ForgotPassword.jsx';
import ResetPassword from './components/pages/Usuario/Componentes/Login/ResetPassword.jsx';
import EditarPerfil from './components/pages/Usuario/Componentes/EditarPerfil.jsx';
import AlterarSenha from './components/pages/Usuario/Componentes/AlterarSenha.jsx';
import Login from './components/pages/Usuario/Componentes/Login/Login.jsx';
import Register from './components/pages/Usuario/Componentes/Login/Registro.jsx';
import Projetos from './components/pages/Project_Page/Components_project/Project_Modals/Projetos.jsx'; 
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
 * ==========================================================
 */
const Unauthorized = () => (
  <div style={{ textAlign: "center", padding: "50px", color: "#777" }}>
    <h1>🚫 Acesso Restrito</h1>
    <p>Você não tem permissão para acessar esta funcionalidade.</p>
    <a href="/" style={{ color: "#222", fontWeight: "bold" }}>Voltar ao Início</a>
  </div>
);

function App() {

  return (
    <Router>
      <ScrollToTop />
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
              2. ROTAS DE USUÁRIO LOGADO (Qualquer cargo)
              Aqui entram: Perfil, Alterar Senha, Página do Usuário
             ==================================================== */}
          <Route element={<PrivateRoute />}>
             <Route path="/usuario" element={<Usuario />} />
             <Route path="/editar-perfil" element={<EditarPerfil />} />
             <Route path="/alterar-senha" element={<AlterarSenha />} />
          </Route>

          {/* ====================================================
              3. ÁREA DE QUESTÕES (BANCO DE DADOS)
              - STUDENT: Cria questões.
              - PROFESSOR: Consulta.
              - REVISOR: Revisa.
             ==================================================== */}
          <Route element={<PrivateRoute allowedRoles={['STUDENT', 'PROFESSOR', 'ADMIN', 'REVISOR']} />}>
            <Route path="/newproject" element={<NewProject/>} />      
            <Route path="/projects" element={<Project />} />          
            <Route path="/projetos/:id" element={<Projetos />} />    
          </Route>

          {/* ====================================================
              4. ÁREA DE PROVAS (SIGILOSA)
              - STUDENT NÃO ENTRA AQUI.
             ==================================================== */}
          <Route element={<PrivateRoute allowedRoles={['PROFESSOR', 'ADMIN', 'REVISOR']} />}>
            <Route path="/montarProva" element={<MontarProva/>} />    
            <Route path="/Prova" element={<Prova/>} />                
          </Route>

           {/* ====================================================
              5. ÁREA DO ADMINISTRADOR
             ==================================================== */}
          <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Rota Coringa (404) - Redireciona para login */}
          <Route path="/*" element={<Navigate to="/login" />} />

        </Routes>
      </Container>
      
      <ConditionalFooter />
    </Router>
  );
}

// Lógica para mostrar o Footer apenas na Home
function ConditionalFooter() {
  const location = useLocation();
  return location.pathname === "/" ? <Footer /> : null;
}
 
export default App;
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import PropTypes from "prop-types";

/*pages*/
import Home from './components/pages/Home/Home.jsx';
import NewProject from './components/pages/Project_Page/NewProject.jsx';
import Project from './components/pages/Project_Page/Projects.jsx';
import Usuario from './components/pages/Usuario/Usuario.jsx';
import Login from './components/pages/Usuario/Componentes/Login/Login.jsx';
import Register from './components/pages/Usuario/Componentes/Login/Registro.jsx';
import Projetos from './components/pages/Project_Page/Components_project/Project_Modals/Projetos.jsx';
import MontarProva from './components/ConfProvas/MontarProva.jsx';
import Prova from './components/pages/Provas/Prova';
/*Hook*/
import useAuth from './hooks/useAuth.jsx'; 
/*Layout*/ 
import Container from './components/Layout/Container.jsx';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import ScrollToTop from "./components/Layout/ScrollToTop.jsx"
/*Swiper*/ 
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'


/*Autenticacao do usuario*/ 
const Private = ({ Item }) => {
  const { signed } = useAuth();

  return signed > 0 ? <Item /> : <Login />;
};

/*Rotas*/ 
function App() {

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Container customClass="min-height">
   
        <Routes>
          {/*Rotas de entrada*/ }
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          {/* Rotas protegidas */}
          <Route path="/" element={<Home/>} />
          <Route path="/projects" element={<Private Item={Project} />} />
          <Route path="/usuario" element={<Private Item={Usuario} />}/>
          <Route path="/newproject"  element={<Private Item={NewProject}/>} />
          
          {/* Rotas de projetos */}
          <Route path="/projetos/:id"  element={<Private Item={Projetos}/>} />
          <Route path="/montarProva"  element={<Private Item={MontarProva}/>} />
          <Route path="/Prova"  element={<Private Item={Prova}/>} />
 

          {/* Página padrão para rotas não encontradas */}
          <Route path="/*" element={<Login/>} />
        </Routes>
      </Container>
      <ConditionalFooter />
    </Router>
  );
}
// Footer só aparece na Home
function ConditionalFooter() {
  const location = useLocation(); // Obtém a rota atual
  // Renderiza o Footer apenas na Home
  return location.pathname === "/" ? <Footer /> : null;
}
// Definindo os tipos das props
Private.propTypes = {
  Item: PropTypes.elementType.isRequired, // Espera um componente React
};

export default App;
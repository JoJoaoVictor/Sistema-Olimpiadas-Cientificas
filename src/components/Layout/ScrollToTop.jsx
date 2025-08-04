import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation(); // Detecta a mudança na URL

  useEffect(() => {
    window.scrollTo(0, 0); // Faz a página rolar para o topo
  }, [pathname]); 

  return null; 
}

export default ScrollToTop;

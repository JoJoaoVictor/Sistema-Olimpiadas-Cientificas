import styles from "./Usuario.module.css";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { FiLogOut } from "react-icons/fi";
import { RiLock2Line } from "react-icons/ri";
import { BsPencil } from 'react-icons/bs';

import { Link } from "react-router-dom";


function Usuario() {
  const { signout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(""); 


  useEffect(() => {
    const stored = localStorage.getItem("user_token");

    if (stored) {
      const userData = JSON.parse(stored);
      const userEmail = userData.username;
  
      setEmail(userEmail);
      setName(userData.name);
      setProfilePic(userData.picture);
    }
  }, []);

  return (
    <div className={styles.container}>
      <h2>Perfil do Usuário</h2>
      <div className={styles.user_img}>
        <img style={{ width: "120px", borderRadius: "50%" }} src={profilePic} alt="Imagem de perfil" />
            <div className={styles.user_text}>
                <p style={{ marginTop: "20px", marginRight: '-10em', fontWeight: "bold" }}>
                  {name}
                  </p> 
                <p className={styles.user_text}>
                  ID: <strong>Professor</strong>
                </p>
              
                <div className={styles.bnt}>
                    <Link className={styles.bnt_password}  to={`/`}>
                    <RiLock2Line style={{ marginRight: "3px" }}/>  Alterar Senha
                    </Link>
                </div>
            </div>

            {/*BNT*/ }
              <div className={styles.bnt}>
                  <Link className={styles.bnt_edit} to={`/`}>
                      <BsPencil style={{ marginRight: "3px" }}/> Editar
                  </Link>
      
      </div>
          
      </div>
      <h2 style={{margin: '25px', marginBottom:'-25px'}}>Informações do Usuário</h2>
        <div className={styles.container}>
            <div className={styles.user_text}>
              <div className={styles.bordas}>
                <p><strong>Nome:</strong> {name}</p>
              </div>
              <div className={styles.bordas}>
                <p><strong>Email:</strong> {email}</p>
              </div>
              <div className={styles.bordas}>
                <p><strong>Tipo de Usuário:</strong> Professor</p>
              </div>
              <div className={styles.bordas}>
                <p><strong>Data de Cadastro:</strong> 01/01/2023</p>
              </div>
              <div className={styles.bordas}>
              <p><strong>Status:</strong> Ativo</p>
              </div>
            
            </div>      
        
        </div>
      <div className={styles.bnt}>
        <button onClick={() => [signout(), navigate("/login")]}>
                <FiLogOut style={{ marginRight: "8px" }} />
                Sair
            </button>
      </div>
      
    </div>

  );
}

export default Usuario;

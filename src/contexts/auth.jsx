/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

// Cria o contexto de autenticação
export const AuthContext = createContext({});

// Provedor de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
 // Verifica se há um usuário logado ao carregar o componente
  useEffect(() => {
    const userToken = localStorage.getItem("user_token");
    // Carrega os usuários do Local Storage ao inicia
    const usersStorage = localStorage.getItem("users_bd");

    if (userToken && usersStorage) {
      const hasUser = JSON.parse(usersStorage)?.filter(
        (user) => user.username === JSON.parse(userToken).username
      );

      if (hasUser) setUser(hasUser[0]);// Define o usuário logado
    }
  }, []);

 // Função de login
  const login = (username, password) => {
    const usersStorage = JSON.parse(localStorage.getItem("users_bd"));

    const hasUser = usersStorage?.filter((user) => user.username === username);

    if (hasUser?.length) {
      if (hasUser[0].username === username && hasUser[0].password === password) {
        const token = Math.random().toString(36).substring(2);// Gera um token aleatório
        localStorage.setItem("user_token", JSON.stringify({ username, token }));// Armazena o token 
        setUser({ username, password });// Define o usuário logado
        return;
      } else {
        return "E-mail ou senha incorretos";
      }
    } else {
      return "Usuário não cadastrado";
    }
  };
// Função de registro
  const registro = (username, password) => {
    const usersStorage = JSON.parse(localStorage.getItem("users_bd"));// Armazena o novo usuário

    const hasUser = usersStorage?.filter((user) => user.username === username);

    if (hasUser?.length) {
      return "Já tem uma conta com esse E-mail";
    }

    let newUser;

    if (usersStorage) {
      newUser = [...usersStorage, { username, password }];
    } else {
      newUser = [{ username, password }];
    }

    localStorage.setItem("users_bd", JSON.stringify(newUser));

    return;
  };
 // Função de logout
  const signout = () => {
    setUser(null);// Remove o usuário logado
    localStorage.removeItem("user_token"); // Remove o token
  };
  return (
    <AuthContext.Provider
      value={{ user, signed: !!user, login, registro, signout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Validação das props
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

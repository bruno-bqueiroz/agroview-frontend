// src/components/Layouts/Sidebar.tsx

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // <<< 1. Importar useNavigate
import { FiLogOut } from 'react-icons/fi'; // Ícone para o botão de sair

interface SidebarProps {
  children: React.ReactNode;
}

const SidebarContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Nav = styled.nav`
  width: 240px;
  background-color: #16a34a; 
  color: white;
  padding: 1.5rem 1rem; 
  position: fixed; 
  top: 0;
  left: 0;
  height: 100vh; 
  overflow-y: auto; 
  z-index: 1000;
  display: flex; // Para alinhar o botão de logout no final
  flex-direction: column; // Para empilhar itens e o botão de logout

  h2 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #f0fdf4; 
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    flex-grow: 1; // Faz a lista de links ocupar o espaço disponível
  }

  li {
    margin-bottom: 0.5rem;
  }

  a, button.logout-button { // Aplicar estilos base para 'a' e o botão de logout
    display: flex; // Alterado para flex para alinhar ícone e texto
    align-items: center;
    gap: 0.75rem; // Espaço entre ícone e texto
    padding: 0.75rem 1rem;
    color: white;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    font-weight: 500;
    width: 100%; // Para o botão de logout
    text-align: left; // Para o botão de logout
    background: none; // Para o botão de logout
    border: none; // Para o botão de logout
    cursor: pointer; // Para o botão de logout

    &:hover,
    &.active { 
      background-color: #12883e;
      color: #ffffff;
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #f0fdf4; 
  margin-left: 240px; 
`;

export default function Sidebar({ children }: SidebarProps) {
  const navigate = useNavigate(); // <<< 2. Inicializar useNavigate

  // <<< 3. Função de Logout >>>
  const handleLogout = () => {
    console.log("FRONTEND: Efetuando logout...");
    // Remover o token de autenticação do localStorage
    localStorage.removeItem('authToken'); 
    
    // Opcional: Limpar qualquer outro estado global relacionado ao usuário aqui
    // (ex: se você estiver usando Context API ou Redux para o estado do usuário)

    // Redirecionar para a página de login
    navigate('/'); 
  };

  return (
    <SidebarContainer>
      <Nav>
        <div> {/* Wrapper para o título e a lista de navegação principal */}
          <h2>AgroView</h2>
          <ul>
            {/* Para o link ativo, você precisará do NavLink do react-router-dom no futuro */}
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/areas">Áreas</a></li>
            <li><a href="/sensors">Sensores</a></li>
            <li><a href="/sensor-data">Dados dos Sensores</a></li>
            {/* Adicione mais links conforme necessário */}
          </ul>
        </div>

        {/* Botão de Logout no final do Sidebar */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <button onClick={handleLogout} className="logout-button"> {/* Aplicar classe para estilo se necessário, ou estilizar 'button.logout-button' diretamente */}
            <FiLogOut /> Sair
          </button>
        </div>
      </Nav>
      <MainContent>
        {children}
      </MainContent>
    </SidebarContainer>
  );
}
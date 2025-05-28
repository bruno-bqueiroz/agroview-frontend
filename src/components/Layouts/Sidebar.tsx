// src/components/Sidebar.tsx

import React from 'react';
import styled from 'styled-components';

interface SidebarProps {
  children: React.ReactNode;
}

const SidebarContainer = styled.div`
  display: flex;
  min-height: 100vh; /* Garante que o container ocupe pelo menos a altura da tela */
`;

const Nav = styled.nav`
  width: 240px;
  background-color: #16a34a; /* Verde AgroView */
  color: white;
  padding: 1.5rem 1rem; /* Ajuste no padding */

  position: fixed; /* <<< Torna o Nav fixo */
  top: 0;
  left: 0;
  height: 100vh; /* <<< Ocupa toda a altura da viewport */
  overflow-y: auto; /* <<< Adiciona scroll se o conteúdo do Nav for grande */
  z-index: 1000; /* <<< Garante que fique acima de outros elementos */

  h2 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #f0fdf4; /* Um tom de branco levemente esverdeado para o título */
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    display: block;
    padding: 0.75rem 1rem;
    color: white;
    text-decoration: none;
    border-radius: 0.375rem; /* 6px */
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    font-weight: 500;

    &:hover,
    &.active { /* Você pode adicionar uma classe 'active' ao link da página atual */
      background-color: #12883e; /* Um verde um pouco mais escuro no hover/ativo */
      color: #ffffff;
    }
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #f0fdf4; /* Cor de fundo do conteúdo que você já tinha */
  margin-left: 240px; /* <<< Compensa a largura do Nav fixo */
  /* O conteúdo aqui dentro rolará normalmente se exceder a altura */
  /* min-height: 100vh; // Pode ser útil se quiser que o MainContent em si tente preencher a viewport */
`;

export default function Sidebar({ children }: SidebarProps) {
  return (
    <SidebarContainer>
      <Nav>
        <h2>AgroView</h2>
        <ul>
          {/* Para o link ativo, você precisará de lógica com o router (ex: NavLink do React Router) */}
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/areas">Áreas</a></li>
          <li><a href="/sensors">Sensores</a></li>
          <li><a href="/sensor-data">Dados dos Sensores</a></li>
          {/* Adicione mais links conforme necessário */}
        </ul>
      </Nav>
      <MainContent>
        {children} {/* O conteúdo da página (Dashboard, Areas, etc.) será renderizado aqui */}
      </MainContent>
    </SidebarContainer>
  );
}
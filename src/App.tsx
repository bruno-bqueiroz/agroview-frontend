// File: src/App.tsx
import React from 'react';                    // opcional com React 17+, mas OK tê-lo
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Sensors from './pages/Sensors';
import SensorData from './pages/SensorData';
import { createGlobalStyle } from 'styled-components';



const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                 Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; /* Fonte mais completa e fallback */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f0fdf4; /* Um fundo base para o body, caso necessário */
    color: #1f2937; /* Cor de texto base */
  }

  /* Outros resets ou estilos base que você queira */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: inherit; /* Ou defina um padrão */
  }

  input, button, textarea, select {
    font: inherit; /* Herda a fonte do body */
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default function App() {
  return (
    
    <BrowserRouter>
    <GlobalStyle /> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/sensors" element={<Sensors />} />
        <Route path="/sensor-data" element={<SensorData />} />
      </Routes>
    </BrowserRouter>
  );
}

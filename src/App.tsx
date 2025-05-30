// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Login from './pages/Login';
import Register from './pages/Register'; // <<< 1. Importar a nova página
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Sensors from './pages/Sensors';
import SensorData from './pages/SensorData';
import Sidebar from './components/Layouts/Sidebar'; // Ajuste o caminho se o seu for diferente
import { Link, useNavigate } from 'react-router-dom'; // Certifique-se que Link está importado


export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* <<< 2. Adicionar a rota para registro */}
        <Route 
          path="/*" 
          element={
            // Aqui você adicionará a lógica de Rota Protegida no futuro
            <Sidebar>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="areas" element={<Areas />} />
                <Route path="sensors" element={<Sensors />} />
                <Route path="sensor-data" element={<SensorData />} />
                {/* Redireciona qualquer outra rota dentro do layout para o dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} /> 
              </Routes>
            </Sidebar>
          }
        />
        {/* Adicionar um fallback geral para rotas não encontradas se desejar */}
        {/* <Route path="*" element={<Navigate to="/" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
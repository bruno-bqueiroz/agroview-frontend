// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Sensors from './pages/Sensors';
import SensorData from './pages/SensorData';
import Sidebar from './components/Layouts/Sidebar'; // Ajuste o caminho
import ProtectedRoute from './components/Auth/ProtectedRoute'; // <<< 1. IMPORTE O ProtectedRoute

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas Protegidas que usam o layout com Sidebar */}
        <Route element={<ProtectedRoute />}> {/* <<< 2. ENVOLVA AS ROTAS PROTEGIDAS */}
          <Route 
            path="app/*"  // <<< 3. UM PREFIXO PARA AS ROTAS INTERNAS (EX: /app/dashboard)
            element={
              <Sidebar>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="areas" element={<Areas />} />
                  <Route path="sensors" element={<Sensors />} />
                  <Route path="sensor-data" element={<SensorData />} />
                  {/* Qualquer rota dentro de /app/* não definida acima, redireciona para /app/dashboard */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} /> 
                </Routes>
              </Sidebar>
            }
          />
        </Route>
        
        {/* Opcional: Redirecionar qualquer outra rota não encontrada para o login ou um 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
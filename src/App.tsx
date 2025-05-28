import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Areas from './pages/Areas';
import Sensors from './pages/Sensors';
import SensorData from './pages/SensorData';
import Sidebar from './components/Layouts/Sidebar';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/*" 
          element={
            <Sidebar>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="areas" element={<Areas />} />
                <Route path="sensors" element={<Sensors />} />
                <Route path="sensor-data" element={<SensorData />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Sidebar>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
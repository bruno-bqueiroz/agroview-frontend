// src/pages/Dashboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FaLeaf, FaMapMarkerAlt, FaTasks, FaExclamationTriangle,
  FaChartLine, FaChartBar, FaBullseye, FaBell, FaLink as FaLinkIcon, FaMapMarkedAlt as FaMapMarkedAltIcon
} from 'react-icons/fa'; // Renomeado FaLink para FaLinkIcon e FaMapMarkedAlt para FaMapMarkedAltIcon para evitar conflito se houver
import { FiAlertCircle, FiCpu, FiLoader } from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis
} from 'recharts';
import axios from 'axios';

// --- Constantes ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MOCK_USER_ID = 3;

// --- Interfaces ---
interface DashboardStats { // Para os dados dinâmicos dos KPIs
  totalAreas: number;
  totalSensors: number;
  activeSensors: number;
}

interface TemperatureReading { // Para o gráfico de temperatura dinâmico
  timestamp: string;
  value: number;
}

// --- Mock Data para Elementos Ainda Não Dinâmicos ---
const mockSummaryStats = { // Para KPIs que ainda não são dinâmicos
  avgTemperature: 24.5, // Exemplo
  upcomingTasks: 3,
  alertsCount: 2, // Usado no KPICard de Alertas
};

const mockHumidityComparisonData = [
  { area: 'Talhão A', umidade: 65 },
  { area: 'Talhão B', umidade: 72 },
  { area: 'Estufa 1', umidade: 60 },
  { area: 'Estufa 2', umidade: 68 },
];

const mockReservoirLevelData = [{ name: 'Nível Reservatório', value: 75, fill: '#3b82f6' }];

const mockActiveAlerts = [
  { id: 'alert1', message: 'Sensor "Umidade Talhão Z" offline.', severity: 'alta' },
  { id: 'alert2', message: 'Temperatura elevada na "Estufa Principal".', severity: 'media' },
];

const mockQuickLinksData = [
  { label: 'Gerenciar Sensores', path: '/sensors', icon: <FiCpu /> },
  { label: 'Ver Áreas', path: '/areas', icon: <FaMapMarkerAlt /> },
  { label: 'Dados Detalhados', path: '/sensor-data', icon: <FaChartLine /> },
  { label: 'Configurações', path: '#', icon: <FaTasks /> },
];


// --- Styled Components (Uma única definição para cada) ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #e6f7ff, #f0fdf4, #e0fff0);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  width: 100%;
  overflow-x: hidden;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1600px; // Ajuste conforme sua preferência
  margin-bottom: 1.5rem;
`;

const StyledFaLeaf = styled(FaLeaf)`
  color: #16a34a;
  margin-right: 0.75rem;
  font-size: 32px;
  @media (min-width: 768px) {
    font-size: 36px;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #004d40;
  @media (min-width: 768px) {
    font-size: 2.2rem;
  }
`;

const DashboardGrid = styled.div`
  width: 100%;
  max-width: 1600px; // Consistente com o Header
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CardBase = styled.div`
  background-color: #fff;
  padding: 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: #005b4f;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg { font-size: 1.2em; opacity: 0.8; }
`;

const KPICard = styled(CardBase)`
  align-items: center;
  text-align: center;
  gap: 0.5rem;
`;

const KPIValue = styled.p`
  font-size: 2.2rem;
  font-weight: 700;
  color: #00796b;
  line-height: 1;
  margin: 0;
`;

const KPILabel = styled.p`
  font-size: 0.85rem;
  color: #555;
  text-transform: uppercase;
  margin: 0;
`;

const ChartContainer = styled(CardBase)`
  min-height: 380px;
  padding-bottom: 0.5rem;
  @media (min-width: 1024px) {
    grid-column: span 2;
  }
`;

const GaugeCard = styled(ChartContainer)``; // Herda de ChartContainer

const AlertsCard = styled(CardBase)`
  background-color: #fffde7;
  border-left: 4px solid #fbc02d;
  @media (min-width: 768px) { grid-column: span 2; }
  @media (min-width: 1024px) { grid-column: span 2; }
`;

const AlertList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
`;

const AlertItem = styled.li<{ severity?: string }>`
  font-size: 0.9rem;
  color: #333;
  padding: 0.6rem 0.2rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  &:last-child { border-bottom: none; }
  &::before { 
    content: ''; display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background-color: ${ (props) => 
      props.severity === 'alta' ? '#d32f2f' :
      props.severity === 'media' ? '#f57c00' : '#388e3c'};
  }
`;

const QuickLinksCard = styled(CardBase)`
  @media (min-width: 1024px) { grid-column: span 2; }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`;

const QuickLinkButton = styled.a`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 1rem 0.5rem; background-color: #f8fafc; border-radius: 0.5rem;
  color: #00796b; font-weight: 500; font-size: 0.85rem; text-align: center;
  transition: background-color 0.2s ease, color 0.2s ease; text-decoration: none;
  min-height: 100px;
  svg { font-size: 1.8rem; margin-bottom: 0.5rem; }
  &:hover { background-color: #00796b; color: #fff; }
`;

const MapPlaceholderCard = styled(CardBase)`
  display: flex; align-items: center; justify-content: center; text-align: center;
  min-height: 300px; background-color: #e0f2f1; color: #004d40;
  @media (min-width: 1024px) { grid-column: span 2; }
  div { display: flex; flex-direction: column; align-items: center; }
  p { font-size: 1rem; max-width: 80%; margin-top: 0.5rem; }
  small { font-size: 0.8rem; color: #00796b; margin-top: 0.5rem; }
  svg { font-size: 3rem; margin-bottom: 1rem; opacity: 0.7; }
`;

const LoadingSpinner = styled(FiLoader)`
  animation: spin 1s linear infinite;
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

const ApiErrorMessage = styled.p`
  color: #b91c1c; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 1rem;
  border-radius: 0.5rem; margin:1rem 0; text-align:center;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
`;

// Função de Formatação de Data (para gráficos e tooltips)
const formatTimestampForDisplay = (isoTimestamp: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!isoTimestamp) return 'N/A';
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
      timeZone: 'America/Cuiaba', // Ajuste para seu fuso horário ou UTC
    };
    return new Date(isoTimestamp).toLocaleString('pt-BR', options || defaultOptions);
  } catch (e) { return "Data Inv."; }
};


export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [temperatureTrendData, setTemperatureTrendData] = useState<TemperatureReading[]>([]);
  const [isLoadingTempTrend, setIsLoadingTempTrend] = useState(true);
  const [tempTrendError, setTempTrendError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/dashboard-stats`);
      setDashboardStats(response.data);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      setStatsError("Falha ao carregar estatísticas.");
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchTemperatureTrend = useCallback(async () => {
    setIsLoadingTempTrend(true);
    setTempTrendError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/dashboard/temperature-trend`);
      setTemperatureTrendData(response.data.map((item: any) => ({
        timestamp: item.timestamp,
        value: Number(item.value)
      })) || []);
    } catch (error) {
      console.error("Erro ao buscar tendência de temperatura:", error);
      setTempTrendError("Falha ao carregar dados de temperatura.");
    } finally {
      setIsLoadingTempTrend(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    fetchTemperatureTrend();
  }, [fetchDashboardStats, fetchTemperatureTrend]);

  return (
    <PageContainer>
      <Header>
        <StyledFaLeaf />
        <Title>AgroView Dashboard</Title>
      </Header>

      {(statsError && <ApiErrorMessage><FiAlertCircle /> {statsError}</ApiErrorMessage>)}
      {(tempTrendError && !statsError && <ApiErrorMessage><FiAlertCircle /> {tempTrendError}</ApiErrorMessage>)}

      <DashboardGrid>
        {/* --- KPIs (Dinâmicos e Mock) --- */}
        <KPICard>
          <FaMapMarkerAlt size={28} color="#42a5f5" />
          {isLoadingStats ? <LoadingSpinner size={30} /> : <KPIValue>{dashboardStats?.totalAreas ?? '...'}</KPIValue>}
          <KPILabel>Áreas Monitoradas</KPILabel>
        </KPICard>
        <KPICard>
          <FiCpu size={28} color="#66bb6a" />
          {isLoadingStats ? <LoadingSpinner size={30} /> : <KPIValue>{dashboardStats?.totalSensors ?? '...'}</KPIValue>}
          <KPILabel>Total de Sensores</KPILabel>
        </KPICard>
        <KPICard>
          <FiCpu size={28} color="#388e3c" />
          {isLoadingStats ? <LoadingSpinner size={30} /> : <KPIValue>{dashboardStats?.activeSensors ?? '...'}</KPIValue>}
          <KPILabel>Sensores Ativos</KPILabel>
        </KPICard>
        <KPICard>
          <FaBell size={28} color="#d32f2f" />
          <KPIValue>{mockSummaryStats.alertsCount}</KPIValue> 
          <KPILabel>Alertas (Mock)</KPILabel>
        </KPICard>

        {/* --- Gráfico de Temperatura (Dinâmico) --- */}
        <ChartContainer>
          <CardTitle><FaChartLine /> Tendência de Temperatura</CardTitle>
          {isLoadingTempTrend ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}><LoadingSpinner size={30} color="#00796b" /></div>
          ) : tempTrendError ? (
             <ApiErrorMessage style={{margin: 'auto', width: '80%'}}><FiAlertCircle/> {tempTrendError}</ApiErrorMessage>
          ) : temperatureTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#555' }}
                  tickFormatter={(isoTimestamp) => formatTimestampForDisplay(isoTimestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  angle={-30} textAnchor="end" height={60} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#555' }} unit="°C" domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(labelIsoTimestamp) => formatTimestampForDisplay(labelIsoTimestamp, {day: '2-digit', month: 'long', year:'numeric', hour: '2-digit', minute: '2-digit'})}
                  formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperatura"]}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="value" name="Temperatura" stroke="#ff7300" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3, fill:"#ff7300" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{textAlign: 'center', color: '#6b7280', marginTop: '2rem'}}>Nenhum dado de temperatura encontrado.</p>
          )}
        </ChartContainer>

        {/* --- Outros Gráficos e Cards (com Dados Mockados) --- */}
        <ChartContainer>
          <CardTitle><FaChartBar /> Umidade do Solo por Área (Mock)</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockHumidityComparisonData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: '#555' }} />
              <YAxis tick={{ fontSize: 11, fill: '#555' }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }} formatter={(value: number) => [`${value}%`, "Umidade"]}/>
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="umidade" name="Umidade" fill="#82ca9d" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <GaugeCard>
          <CardTitle><FaBullseye /> Nível do Reservatório (Mock)</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart innerRadius="70%" outerRadius="90%" data={mockReservoirLevelData} startAngle={180} endAngle={0} barSize={30}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={15} fill={mockReservoirLevelData[0].fill} />
              <Legend 
                iconSize={10} layout="vertical" verticalAlign="bottom" align="center" 
                payload={[{ value: `${mockReservoirLevelData[0].name}: ${mockReservoirLevelData[0].value}%`, type: 'square', color: mockReservoirLevelData[0].fill }]}
              />
              <Tooltip contentStyle={{ display: 'none' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </GaugeCard>
        
        <AlertsCard>
          <CardTitle><FaBell /> Alertas Recentes ({mockActiveAlerts.length})</CardTitle>
          {mockActiveAlerts.length > 0 ? (
            <AlertList>
              {mockActiveAlerts.map(alert => (
                <AlertItem key={alert.id} severity={alert.severity}>
                  {alert.message}
                </AlertItem>
              ))}
            </AlertList>
          ) : ( <p style={{ fontSize: '0.9rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>Nenhum alerta.</p> )}
        </AlertsCard>
        
        <QuickLinksCard>
          <CardTitle><FaLinkIcon /> Atalhos Rápidos</CardTitle>
          <QuickLinksGrid>
            {mockQuickLinksData.map(link => (
              <QuickLinkButton key={link.label} href={link.path} title={link.label}>
                {link.icon}
                {link.label}
              </QuickLinkButton>
            ))}
          </QuickLinksGrid>
        </QuickLinksCard>

        <MapPlaceholderCard>
          <div>
            <FaMapMarkedAltIcon />
            <CardTitle style={{ justifyContent: 'center', color: '#004d40' }}>Visão Geral do Mapa</CardTitle>
            <p>Aqui seria exibido um mapa interativo com as áreas monitoradas. (Ex: Leaflet.js)</p>
            <small>(Coordenadas viriam do cadastro de Áreas)</small>
          </div>
        </MapPlaceholderCard>

      </DashboardGrid>
    </PageContainer>
  );
}
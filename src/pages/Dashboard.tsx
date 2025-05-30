// src/pages/Dashboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FaLeaf, FaMapMarkerAlt, FaTasks, FaExclamationTriangle,
  FaChartLine, FaChartBar, FaBullseye, FaBell, FaLink as FaLinkIcon, FaMapMarkedAlt as FaMapMarkedAltIcon
} from 'react-icons/fa';
import { FiAlertCircle, FiCpu, FiLoader } from 'react-icons/fi'; // FiLink foi removido para evitar conflito com FaLinkIcon
import {
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis
} from 'recharts';
import { api } from '../services/api'; // Usando a instância configurada do Axios

// --- Interfaces ---
interface DashboardStats {
  totalAreas: number;
  totalSensors: number;
  activeSensors: number;
}

interface TemperatureReading {
  timestamp: string; // String ISO do backend
  value: number;
}

// --- Mock Data para Elementos Ainda Não Dinâmicos ---
const mockDashboardOtherStats = { // Para KPIs que ainda não são dinâmicos
  alertsCount: 2, // Usado no KPICard de Alertas
  // avgTemperature e upcomingTasks foram removidos dos KPIs mockados
  // pois os principais KPIs agora são dinâmicos.
  // Se precisar deles, adicione-os aqui.
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
  { label: 'Gerenciar Sensores', path: '/app/sensors', icon: <FiCpu /> }, // Atualizado path
  { label: 'Ver Áreas', path: '/app/areas', icon: <FaMapMarkerAlt /> },   // Atualizado path
  { label: 'Dados Detalhados', path: '/app/sensor-data', icon: <FaChartLine /> }, // Atualizado path
  { label: 'Configurações', path: '#', icon: <FaTasks /> }, // Placeholder path
];


// --- Styled Components ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #e6f7ff, #f0fdf4, #e0fff0);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  width: 100%;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1600px; 
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
  max-width: 1600px;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1200px) { // Ajustado para 1200px para 4 colunas
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CardBase = styled.div`
  background-color: #fff;
  padding: 1.5rem; // Aumentado padding
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
  margin-top: 0; // Removido margin-top padrão de h2
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg { font-size: 1.2em; opacity: 0.8; }
`;

const KPICard = styled(CardBase)`
  align-items: center;
  text-align: center;
  gap: 0.5rem; // Espaçamento entre ícone, valor e label
`;

const KPIValue = styled.p`
  font-size: 2.2rem;
  font-weight: 700;
  color: #00796b;
  line-height: 1;
  margin: 0;
`;

const KPILabel = styled.p`
  font-size: 0.8rem; // Ligeiramente menor
  color: #374151; // Mais escuro para melhor contraste
  text-transform: uppercase;
  margin: 0;
  font-weight: 500;
`;

const ChartContainer = styled(CardBase)`
  min-height: 380px;
  @media (min-width: 1024px) {
    grid-column: span 2; // Gráficos principais ocupam 2 colunas
  }
`;

const GaugeCard = styled(ChartContainer)``;

const AlertsCard = styled(CardBase)`
  background-color: #fffde7;
  border-left: 4px solid #fbc02d;
  @media (min-width: 768px) { grid-column: span 2; }
  @media (min-width: 1200px) { grid-column: span 2; } // Ajustado para grid de 4 colunas
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
      props.severity === 'alta' ? '#ef4444' : // Vermelho para alta
      props.severity === 'media' ? '#ffa726' : // Laranja para média
      '#66bb6a'}; // Verde para baixa (ou default)
  }
`;

const QuickLinksCard = styled(CardBase)`
  @media (min-width: 1024px) { grid-column: span 2; }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); // Ajustado minmax
  gap: 1rem;
`;

const QuickLinkButton = styled.a` // Idealmente seria <Link> do react-router-dom
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 1rem 0.5rem; background-color: #f8fafc; border-radius: 0.5rem;
  color: #00796b; font-weight: 500; font-size: 0.85rem; text-align: center;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease; text-decoration: none;
  min-height: 100px;
  border: 1px solid #e5e7eb;
  svg { font-size: 1.8rem; margin-bottom: 0.5rem; }
  &:hover { background-color: #00796b; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
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
  border-radius: 0.5rem; margin: 0 auto 1.5rem auto; /* Centralizado e com margem */ text-align:center;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; max-width: 1200px; // Mesma largura do grid para consistência
`;

// Função de Formatação de Data
const formatTimestampForDisplay = (isoTimestamp?: string | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!isoTimestamp) return 'N/A';
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
      timeZone: 'America/Cuiaba',
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

  const fetchDashboardData = useCallback(async () => {
    setIsLoadingStats(true);
    setIsLoadingTempTrend(true);
    setStatsError(null);
    setTempTrendError(null);

    try {
      // Usar Promise.all para buscar dados em paralelo
      const [statsResponse, tempTrendResponse] = await Promise.all([
        api.get('/users/dashboard-stats'), // Rota ajustada para não precisar de :userId no path
        api.get('/users/dashboard/temperature-trend') // Rota ajustada
      ]);

      setDashboardStats(statsResponse.data);
      setTemperatureTrendData(tempTrendResponse.data.map((item: any) => ({
        timestamp: item.timestamp,
        value: Number(item.value)
      })) || []);

    } catch (error: any) {
      console.error("Erro ao buscar dados do dashboard:", error);
      // Define erros específicos ou um erro geral
      if (!dashboardStats) setStatsError("Falha ao carregar estatísticas.");
      if (!temperatureTrendData.length) setTempTrendError("Falha ao carregar dados de temperatura.");
      // Se quiser um erro geral na ApiErrorMessage:
      // setApiError("Falha ao carregar dados do dashboard.");
    } finally {
      setIsLoadingStats(false);
      setIsLoadingTempTrend(false);
    }
  }, []); // Removido MOCK_USER_ID das dependências, pois não é mais usado diretamente nas chamadas

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <PageContainer>
      <Header>
        <StyledFaLeaf />
        <Title>AgroView Dashboard</Title>
      </Header>

      {/* Exibe erro principal se houver erro em alguma das buscas */}
      {(statsError && <ApiErrorMessage><FiAlertCircle /> {statsError}</ApiErrorMessage>)}
      {(tempTrendError && !statsError && <ApiErrorMessage><FiAlertCircle /> {tempTrendError}</ApiErrorMessage>)} {/* Mostra erro de temp se não houver erro de stats */}


      <DashboardGrid>
        {/* --- KPIs --- */}
        <KPICard>
          <FaMapMarkerAlt size={32} color="#42a5f5" /> {/* Ícone um pouco maior */}
          {isLoadingStats ? <LoadingSpinner size={36} /> : <KPIValue>{dashboardStats?.totalAreas ?? '...'}</KPIValue>}
          <KPILabel>Áreas Monitoradas</KPILabel>
        </KPICard>
        <KPICard>
          <FiCpu size={32} color="#66bb6a" />
          {isLoadingStats ? <LoadingSpinner size={36} /> : <KPIValue>{dashboardStats?.totalSensors ?? '...'}</KPIValue>}
          <KPILabel>Total de Sensores</KPILabel>
        </KPICard>
        <KPICard>
          <FiCpu size={32} color="#388e3c" />
          {isLoadingStats ? <LoadingSpinner size={36} /> : <KPIValue>{dashboardStats?.activeSensors ?? '...'}</KPIValue>}
          <KPILabel>Sensores Ativos</KPILabel>
        </KPICard>
        <KPICard> {/* Mantendo um KPI mockado como exemplo */}
          <FaBell size={32} color="#ef5350" /> {/* Cor ajustada */}
          <KPIValue>{mockDashboardOtherStats.alertsCount}</KPIValue> 
          <KPILabel>Alertas (Mock)</KPILabel>
        </KPICard>

        {/* --- Gráfico de Temperatura (Dinâmico) --- */}
        <ChartContainer>
          <CardTitle><FaChartLine /> Tendência de Temperatura</CardTitle>
          {isLoadingTempTrend ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '280px' }}><LoadingSpinner size={36} color="#00796b" /></div>
          ) : tempTrendError ? (
             <ApiErrorMessage style={{margin: 'auto', width: '90%'}}><FiAlertCircle/> {tempTrendError}</ApiErrorMessage>
          ) : temperatureTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 40 }}> {/* Aumentado bottom margin */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#555' }}
                  tickFormatter={(isoTimestamp) => formatTimestampForDisplay(isoTimestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  angle={-30} textAnchor="end" height={60} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#555' }} unit="°C" domain={['dataMin - 1', 'dataMax + 1']} allowDataOverflow={false} />
                <Tooltip
                  labelFormatter={(labelIsoTimestamp) => formatTimestampForDisplay(labelIsoTimestamp, {day: '2-digit', month: 'long', year:'numeric', hour: '2-digit', minute: '2-digit'})}
                  formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperatura"]}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="value" name="Temperatura" stroke="#ff7300" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3, fill:"#ff7300" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{textAlign: 'center', color: '#6b7280', marginTop: '2rem'}}>Nenhum dado de temperatura para exibir.</p>
          )}
        </ChartContainer>

        {/* --- Outros Gráficos e Cards (com Dados Mockados) --- */}
        <ChartContainer>
          <CardTitle><FaChartBar /> Umidade do Solo (Mock)</CardTitle>
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
          <CardTitle><FaBullseye /> Nível Reservatório (Mock)</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart innerRadius="70%" outerRadius="90%" data={mockReservoirLevelData} startAngle={180} endAngle={0} barSize={30}>
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={15} fill={mockReservoirLevelData[0].fill} />
              <Legend iconSize={10} layout="vertical" verticalAlign="bottom" align="center" 
                payload={[{ value: `${mockReservoirLevelData[0].name}: ${mockReservoirLevelData[0].value}%`, type: 'square', color: mockReservoirLevelData[0].fill }]} />
              <Tooltip contentStyle={{ display: 'none' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </GaugeCard>
        
        <AlertsCard>
          <CardTitle><FaBell /> Alertas Recentes ({mockActiveAlerts.length})</CardTitle>
          {mockActiveAlerts.length > 0 ? (
            <AlertList>
              {mockActiveAlerts.map(alert => (
                <AlertItem key={alert.id} severity={alert.severity}> {alert.message} </AlertItem>
              ))}
            </AlertList>
          ) : ( <p style={{ fontSize: '0.9rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>Nenhum alerta.</p> )}
        </AlertsCard>
        
        <QuickLinksCard>
          <CardTitle><FaLinkIcon /> Atalhos Rápidos</CardTitle>
          <QuickLinksGrid>
            {mockQuickLinksData.map(link => (
              <QuickLinkButton key={link.label} href={link.path} title={link.label}>
                {link.icon} {link.label}
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
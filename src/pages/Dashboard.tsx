// src/pages/Dashboard.tsx
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FaLeaf, FaMapMarkerAlt, FaTasks, FaExclamationTriangle,
  FaChartLine, FaChartBar, FaBullseye, FaBell, FaLink, FaMapMarkedAlt
} from 'react-icons/fa';
import { FiAlertCircle, FiCpu, FiLink, FiLoader } from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis
} from 'recharts';
import axios from 'axios';

// --- Mock Data ---
const kpiData = {
  totalAreas: 7,
  activeSensors: 23,
  sensorAlerts: 3,
  upcomingTasks: 5,
};

const temperatureTrendData = [
  { name: '00:00', temp: 22 }, { name: '03:00', temp: 21.5 },
  { name: '06:00', temp: 21 }, { name: '09:00', temp: 23 },
  { name: '12:00', temp: 25 }, { name: '15:00', temp: 26 },
  { name: '18:00', temp: 24 }, { name: '21:00', temp: 23 },
];

const humidityComparisonData = [
  { area: 'Talhão A', umidade: 65 },
  { area: 'Talhão B', umidade: 72 },
  { area: 'Estufa 1', umidade: 60 },
  { area: 'Estufa 2', umidade: 68 },
];


const reservoirLevelData = [{ name: 'Nível', value: 75, fill: '#3b82f6' }]; // 75%


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MOCK_USER_ID = 3; // Usaremos para buscar as estatísticas

// --- Interfaces para os Dados do Dashboard ---
interface DashboardStats {
  totalAreas: number;
  totalSensors: number;
  activeSensors: number;
  // Adicionar outras estatísticas se o backend as fornecer
}



const dailyTemperatureData = [
  { day: 'Seg', temp: 22 }, { day: 'Ter', temp: 24 }, { day: 'Qua', temp: 23 },
  { day: 'Qui', temp: 25 }, { day: 'Sex', temp: 26 }, { day: 'Sáb', temp: 24 },
  { day: 'Dom', temp: 23 },
];
const mockAlertsCount = 2; // Mock para o card de alertas por enquanto





const activeAlerts = [
  { id: 'alert1', message: 'Sensor de pH do Talhão B offline.', severity: 'alta' },
  { id: 'alert2', message: 'Umidade baixa na Estufa 1.', severity: 'media' },
  { id: 'alert3', message: 'Bateria fraca no Sensor TEMP-05.', severity: 'baixa' },
];

const quickLinksData = [
  { label: 'Gerenciar Sensores', path: '/sensors', icon: <FiCpu /> },
  { label: 'Ver Áreas', path: '/areas', icon: <FaMapMarkerAlt /> },
  { label: 'Relatórios Detalhados', path: '#', icon: <FaChartLine /> }, // Placeholder path
  { label: 'Configurações', path: '#', icon: <FaTasks /> }, // Usando FaTasks como exemplo
];



// --- Interfaces ---
interface DashboardStats {
  totalAreas: number;
  totalSensors: number;
  activeSensors: number;
}

interface TemperatureReading { // Para os dados do gráfico de temperatura
  timestamp: string; // String ISO do backend
  value: number;     // Valor da temperatura
  // Adicionar sensorName se o backend retornar e você quiser diferenciar linhas no gráfico
  // sensorName?: string; 
}


const formatTimestampForDisplay = (isoTimestamp: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!isoTimestamp) return 'N/A';
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short',
      timeZone: 'America/Cuiaba', // Ajuste para seu fuso horário ou UTC
    };
    return new Date(isoTimestamp).toLocaleString('pt-BR', options || defaultOptions);
  } catch (e) {
    return "Data Inv.";
  }
};


export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // <<< NOVOS ESTADOS PARA O GRÁFICO DE TEMPERATURA >>>
  const [temperatureTrendData, setTemperatureTrendData] = useState<TemperatureReading[]>([]);
  const [isLoadingTempTrend, setIsLoadingTempTrend] = useState(true);
  const [tempTrendError, setTempTrendError] = useState<string | null>(null);


  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/dashboard-stats`);
      setDashboardStats(response.data);
    } catch (error) { /* ... tratamento de erro ... */ setStatsError("Falha ao carregar estatísticas.");} 
    finally { setIsLoadingStats(false); }
  }, []);

  // <<< NOVA FUNÇÃO PARA BUSCAR DADOS DA TENDÊNCIA DE TEMPERATURA >>>
  const fetchTemperatureTrend = useCallback(async () => {
    setIsLoadingTempTrend(true);
    setTempTrendError(null);
    try {
      // Você pode adicionar query params aqui se o backend os suportar (ex: ?limit=30 ou ?period=7d)
      const response = await axios.get(`${API_BASE_URL}/users/${MOCK_USER_ID}/dashboard/temperature-trend`);
      // O backend já deve retornar os dados ordenados por timestamp ASC
      setTemperatureTrendData(response.data.map((item: any) => ({
        timestamp: item.timestamp, // Mantém string ISO para dataKey
        value: Number(item.value)  // Garante que 'value' seja número
      })) || []);
    } catch (error) {
      console.error("Erro ao buscar tendência de temperatura:", error);
      setTempTrendError("Não foi possível carregar os dados de temperatura.");
      setTemperatureTrendData([]);
    } finally {
      setIsLoadingTempTrend(false);
    }
  }, []); // MOCK_USER_ID é constante

  useEffect(() => {
    // Busca ambos os conjuntos de dados quando o componente monta
    fetchDashboardStats();
    fetchTemperatureTrend();
  }, [fetchDashboardStats, fetchTemperatureTrend]); // As dependências são estáveis

  // Mock data para links rápidos
  const quickLinksData = [ /* ... seus links ... */ ];

  return (
    <PageContainer>
      <Header>
        <StyledFaLeaf />
        <Title>AgroView Dashboard</Title>
      </Header>

      {/* Exibe erro principal se houver erro nas estatísticas OU no gráfico de temperatura */}
      {(statsError && <ApiErrorMessage><FiAlertCircle /> {statsError}</ApiErrorMessage>)}
      {(tempTrendError && !statsError && <ApiErrorMessage><FiAlertCircle /> {tempTrendError}</ApiErrorMessage>)}


      <DashboardGrid>
        {/* KPIs (como na versão anterior, usando dashboardStats) */}
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
          <KPIValue>{mockAlertsCount}</KPIValue> 
          <KPILabel>Alertas Ativos (Mock)</KPILabel>
        </KPICard>

        {/* --- GRÁFICO DE TEMPERATURA ATUALIZADO --- */}
        <ChartContainer>
          <CardTitle><FaChartLine /> Tendência de Temperatura</CardTitle>
          {isLoadingTempTrend ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <LoadingSpinner size={30} color="#00796b" />
            </div>
          ) : tempTrendError ? (
             <ApiErrorMessage style={{margin: 'auto', width: '80%'}}><FiAlertCircle/> {tempTrendError}</ApiErrorMessage>
          ) : temperatureTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={temperatureTrendData} // <<< USA DADOS REAIS
                margin={{ top: 5, right: 30, left: 0, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="timestamp" // <<< USA O TIMESTAMP ISO ORIGINAL
                  tick={{ fontSize: 10, fill: '#555' }}
                  tickFormatter={(isoTimestamp) => formatTimestampForDisplay(isoTimestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10, fill: '#555' }} unit="°C" domain={['auto', 'auto']} />
                <Tooltip
                  labelFormatter={(labelIsoTimestamp) => formatTimestampForDisplay(labelIsoTimestamp, {day: '2-digit', month: 'long', year:'numeric', hour: '2-digit', minute: '2-digit'})}
                  formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperatura"]}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="value" name="Temperatura" stroke="#ff7300" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3, fill:"#ff7300" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{textAlign: 'center', color: '#6b7280', marginTop: '2rem'}}>Nenhum dado de temperatura encontrado para exibir.</p>
          )}
        </ChartContainer>

        {/* Outros Gráficos e Cards (mantêm dados mockados por enquanto) */}
        <ChartContainer>
          <CardTitle><FaChartBar /> Umidade por Área (Mock)</CardTitle>
           {/* ... Seu BarChart com humidityComparisonData ... */}
        </ChartContainer>
        <GaugeCard>
          <CardTitle><FaBullseye /> Nível do Reservatório (Mock)</CardTitle>
          {/* ... Seu RadialBarChart com reservoirLevelData ... */}
        </GaugeCard>
        <AlertsCard>
          <CardTitle><FaBell /> Alertas Recentes (Mock)</CardTitle>
          {/* ... Seus AlertItems mockados ... */}
        </AlertsCard>
        <QuickLinksCard>
          <CardTitle><FiLink /> Atalhos Rápidos</CardTitle>
          {/* ... Seus QuickLinkButtons ... */}
        </QuickLinksCard>
        <MapPlaceholderCard>
          {/* ... Seu placeholder de mapa ... */}
        </MapPlaceholderCard>

      </DashboardGrid>
    </PageContainer>
  );
}


// --- Styled Components ---
// Mantendo os estilos base que você forneceu e expandindo


const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #e6f7ff, #f0fdf4, #e0fff0); /* Suave e claro */
  display: flex;
  flex-direction: column;
  /* Se o sidebar for fixo à esquerda, este container deve ocupar o espaço restante.
     Ex: width: calc(100vw - sidebarWidth); margin-left: sidebarWidth;
     Por agora, assumindo que ele é o conteúdo principal. */
  align-items: center; /* Centraliza o DashboardLayoutGrid se ele tiver max-width */
  padding: 1.5rem; /* Ajuste no padding geral da página */
  overflow-x: hidden; /* Prevenir scroll horizontal por segurança */
`;
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Alinhar à esquerda se o DashboardLayoutGrid for 100% */
  width: 100%;
  max-width: 1400px; /* Aumentar max-width para o conteúdo do dashboard */
  margin-bottom: 1.5rem;
`;

const StyledFaLeaf = styled(FaLeaf)`
  color: #16a34a;
  margin-right: 0.75rem;
  font-size: 32px; // Levemente menor para o header interno
  @media (min-width: 768px) {
    font-size: 36px;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem; // Levemente menor
  font-weight: 700;
  color: #004d40;
  @media (min-width: 768px) {
    font-size: 2.2rem;
  }
`;

// Grid principal para o layout do Dashboard
const DashboardLayoutGrid = styled.div`
  width: 100%;
  max-width: 1400px;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr; /* Default para mobile: uma coluna */

  /* Desktop: layout mais complexo */
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr); /* Duas colunas para tablet */
  }
  @media (min-width: 1024px) {
    /* Exemplo: KPIs em uma linha, depois gráficos, depois outras seções */
    /* Este é um layout de exemplo, pode ser ajustado com grid-template-areas */
    grid-template-columns: repeat(4, 1fr);
  }
`;

// Componente base para os cards
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
  color: #005b4f; /* Verde mais escuro para títulos de card */
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    font-size: 1.2em; /* Ícone um pouco maior que o texto */
    opacity: 0.8;
  }
`;

// KPI Cards
const KPICard = styled(CardBase)`
  align-items: center;
  text-align: center;

  @media (min-width: 1024px) {
    /* KPIs podem ocupar uma coluna cada no grid de 4 colunas */
  }
`;

const KPIValue = styled.p`
  font-size: 2.2rem;
  font-weight: 700;
  color: #00796b;
  line-height: 1;
  margin-bottom: 0.25rem;
`;

const KPILabel = styled.p`
  font-size: 0.85rem;
  color: #555;
  text-transform: uppercase;
`;

// Chart Cards
const ChartCard = styled(CardBase)`
  min-height: 350px; /* Altura mínima para gráficos */
  
  @media (min-width: 768px) {
    /* Em tablets, gráficos podem ocupar a largura total da coluna */
  }
  @media (min-width: 1024px) {
    /* No grid de 4 colunas, gráficos podem ocupar 2 colunas */
    grid-column: span 2;
    /* O primeiro gráfico de linha pode ser maior */
    &:first-of-type { 
        /* grid-row: span 2; // Se quiser que ele seja mais alto também */
    }
  }
`;

// Gauge Chart específico (RadialBarChart)
const GaugeCard = styled(ChartCard)`
  @media (min-width: 1024px) {
    grid-column: span 2; /* Pode ocupar 2 colunas, como um gráfico normal */
  }
`;

// Alerts Section
const AlertsCard = styled(CardBase)`
  background-color: #fffde7; /* Amarelo bem claro para alertas */
  border-left: 4px solid #fbc02d; /* Destaque amarelo */
  
  @media (min-width: 768px) {
    grid-column: span 2; /* Ocupa a largura de duas colunas em tablet */
  }
  @media (min-width: 1024px) {
    grid-column: span 2; /* Ocupa 2 colunas no grid de 4 */
  }
`;

const AlertList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 250px; /* Limitar altura e adicionar scroll se necessário */
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

  &:last-child {
    border-bottom: none;
  }

  &::before { /* Indicador de severidade visual */
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props =>
      props.severity === 'alta' ? '#d32f2f' :
      props.severity === 'media' ? '#f57c00' : '#388e3c'}; /* Vermelho, Laranja, Verde */
  }
`;

// Quick Links Section
const QuickLinksCard = styled(CardBase)`
  @media (min-width: 768px) {
    /* Pode ocupar largura total no tablet se outros elementos estiverem acima/abaixo */
  }
  @media (min-width: 1024px) {
    grid-column: span 2; /* Ocupa 2 colunas */
  }
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const QuickLinkButton = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  color: #00796b;
  font-weight: 500;
  text-align: center;
  transition: background-color 0.2s ease, color 0.2s ease;
  text-decoration: none;

  svg {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  &:hover {
    background-color: #00796b;
    color: #fff;
  }
`;

// Map Placeholder Section
const MapPlaceholderCard = styled(CardBase)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 300px; /* Altura similar a um gráfico */
  background-color: #eef7ff; /* Fundo azulado claro */
  color: #607d8b; /* Cinza azulado */
  
  @media (min-width: 1024px) {
    grid-column: span 2; /* Ocupa 2 colunas */
  }

  p {
    font-size: 1rem;
    max-width: 80%;
  }
  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.7;
  }
`;

const LoadingSpinner = styled(FiLoader)` animation: spin 1s linear infinite; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
const ApiErrorMessage = styled.p` color: #b91c1c; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 1rem; border-radius: 0.5rem; margin:1rem 0; text-align:center; display: flex; align-items: center; justify-content: center; gap: 0.5rem;`;




const DashboardGrid = styled.div`
  width: 100%;
  max-width: 1400px; /* Ou o max-width que você decidiu (ex: 1600px) */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem; // Espaçamento entre os cards

  @media (min-width: 768px) { // Para tablets
    grid-template-columns: repeat(2, 1fr); // Exemplo: 2 colunas
  }
  @media (min-width: 1024px) { // Para desktops
    grid-template-columns: repeat(4, 1fr); // Exemplo: 4 colunas para KPIs, gráficos podem usar span
  }
`;


// ChartContainer herda de CardBase
const ChartContainer = styled(CardBase)`
  min-height: 380px; // Altura mínima para acomodar bem o gráfico
  padding-bottom: 0.5rem; // Menos padding no fundo se a legenda do gráfico já der espaço

  @media (min-width: 1024px) {
    grid-column: span 2; // Faz o gráfico ocupar 2 colunas no grid de 4
    // Ex: &:first-of-type { grid-row: span 2; } // Se quisesse que o primeiro gráfico fosse mais alto
  }
`;


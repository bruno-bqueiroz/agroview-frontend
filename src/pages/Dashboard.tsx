// src/pages/Dashboard.tsx
import React from 'react';
import styled from 'styled-components';
import {
  FaLeaf, FaMapMarkerAlt, FaTasks, FaExclamationTriangle,
  FaChartLine, FaChartBar, FaBullseye, FaBell, FaLink, FaMapMarkedAlt
} from 'react-icons/fa';
import { FiCpu } from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, RadialBarChart, RadialBar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PolarAngleAxis
} from 'recharts';

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





// --- Dashboard Component ---
export default function Dashboard() {
  return (
    <PageContainer>
      <Header>
        <StyledFaLeaf />
        <Title>AgroView Dashboard</Title>
      </Header>

      <DashboardLayoutGrid>
        {/* --- KPIs --- */}
        <KPICard>
          <FaMapMarkerAlt size={28} color="#42a5f5" />
          <KPIValue>{kpiData.totalAreas}</KPIValue>
          <KPILabel>Áreas Monitoradas</KPILabel>
        </KPICard>
        <KPICard>
          <FiCpu size={28} color="#66bb6a" />
          <KPIValue>{kpiData.activeSensors}</KPIValue>
          <KPILabel>Sensores Ativos</KPILabel>
        </KPICard>
        <KPICard>
          <FaExclamationTriangle size={28} color="#ffa726" />
          <KPIValue>{kpiData.sensorAlerts}</KPIValue>
          <KPILabel>Alertas de Sensores</KPILabel>
        </KPICard>
        <KPICard>
          <FaTasks size={28} color="#78909c" />
          <KPIValue>{kpiData.upcomingTasks}</KPIValue>
          <KPILabel>Tarefas Agendadas</KPILabel>
        </KPICard>

        {/* --- Line Chart (Temperature Trend) --- */}
        <ChartCard>
          <CardTitle><FaChartLine /> Tendência de Temperatura (Últimas 24h)</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperatureTrendData} margin={{ top: 5, right: 25, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#555' }} />
              <YAxis tick={{ fontSize: 11, fill: '#555' }} unit="°C" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }}/>
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="temp" name="Temperatura" stroke="#ff7300" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* --- Bar Chart (Humidity Comparison) --- */}
        <ChartCard>
          <CardTitle><FaChartBar /> Umidade do Solo por Área</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={humidityComparisonData} margin={{ top: 5, right: 25, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: '#555' }} angle={-15} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11, fill: '#555' }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }}/>
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="umidade" name="Umidade" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* --- Gauge Chart (Reservoir Level - using RadialBarChart) --- */}
        <GaugeCard>
          <CardTitle><FaBullseye /> Nível do Reservatório Principal</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              innerRadius="70%"
              outerRadius="90%"
              data={reservoirLevelData}
              startAngle={180}
              endAngle={0}
              barSize={30}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background
                dataKey="value" // O Recharts usará isso para obter o valor numérico (75)
                angleAxisId={0}
                // fill="#3b82f6" // A cor é pega de reservoirLevelData[index].fill
                cornerRadius={15}
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="bottom"
                align="center"
                formatter={(value, entry, index) => {
                  // Acessamos o nosso objeto de dados original usando o index
                  const dataPoint = reservoirLevelData[index];

                  if (dataPoint && typeof dataPoint.name === 'string' && typeof dataPoint.value === 'number') {
                    // O componente Legend já renderiza a bolinha colorida usando entry.color (que virá de dataPoint.fill)
                    // Aqui formatamos apenas o texto.
                    return <span style={{ color: '#555' }}>{`${dataPoint.name}: ${dataPoint.value}%`}</span>;
                  }
                  
                  // Fallback: se algo der errado com dataPoint
                  // 'value' (primeiro argumento do formatter) é frequentemente o dataKey ou o 'name' da série.
                  // Neste caso, como RadialBar não tem 'name' prop e dataKey é 'value', 'value' seria 75.
                  // Se você quiser mostrar o nome padrão da legenda caso dataPoint falhe:
                  // return <span style={{ color: '#555' }}>{value || 'Indisponível'}</span>;
                  // Mas como estamos buscando name e value do dataPoint, um fallback genérico é bom.
                  return <span style={{ color: '#555' }}>Informação Indisponível</span>;
                }}
              />
              <Tooltip contentStyle={{ display: 'none' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </GaugeCard>

        {/* --- Alerts Section --- */}
        <AlertsCard>
          <CardTitle><FaBell /> Alertas e Notificações ({activeAlerts.length})</CardTitle>
          {activeAlerts.length > 0 ? (
            <AlertList>
              {activeAlerts.map(alert => (
                <AlertItem key={alert.id} severity={alert.severity}>
                  {alert.message}
                </AlertItem>
              ))}
            </AlertList>
          ) : (
            <p style={{ fontSize: '0.9rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
              Nenhum alerta no momento.
            </p>
          )}
        </AlertsCard>
        
        {/* --- Quick Links Section --- */}
        <QuickLinksCard>
          <CardTitle><FaLink /> Atalhos Rápidos</CardTitle>
          <QuickLinksGrid>
            {quickLinksData.map(link => (
              <QuickLinkButton key={link.label} href={link.path} title={link.label}>
                {link.icon}
                {link.label}
              </QuickLinkButton>
            ))}
          </QuickLinksGrid>
        </QuickLinksCard>

        {/* --- Mini-Map Placeholder --- */}
        <MapPlaceholderCard>
          <div>
            <FaMapMarkedAlt />
            <CardTitle style={{ justifyContent: 'center' }}>Visão Geral do Mapa</CardTitle>
            <p>Integração do mini-mapa de áreas monitoradas aparecerá aqui.</p>
          </div>
        </MapPlaceholderCard>

      </DashboardLayoutGrid>
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
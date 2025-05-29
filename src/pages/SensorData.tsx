// src/pages/SensorData.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FiActivity, FiDatabase, FiList, FiThermometer, FiBarChart2, FiPlus, FiLoader, FiAlertCircle, FiSave } from 'react-icons/fi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// --- Interfaces ---
interface ISensorOption {
  id: number;
  name: string;
  type: string;
}

interface ISensorDataReading {
  id: number;
  sensorId: number;
  value: number;
  timestamp: string; // Manter como string ISO original do backend
}

interface AddReadingFormData {
  value: number;
  timestamp?: string; // Do input datetime-local (YYYY-MM-DDTHH:mm)
}

// --- Constantes ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MOCK_USER_ID = 3;

// --- Styled Components (COLE AQUI TODOS OS SEUS STYLED COMPONENTS DEFINIDOS ANTERIORMENTE) ---
const PageContainer = styled.div` /* ...seus estilos... */ 
  padding: 2rem; background-color: #f0fdf4; min-height: calc(100vh - 4rem);
`;
const Header = styled.header` /* ...seus estilos... */ 
  display: flex; align-items: center;  margin-bottom: 2rem; gap: 0.75rem;
`;
const Title = styled.h1` /* ...seus estilos... */ 
  font-size: 2rem; font-weight: 700; color: #004d40;
`;
const ControlRow = styled.div` /* ...seus estilos... */ 
  display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap;
`;
const SensorSelectGroup = styled.div` /* ...seus estilos... */ 
  display: flex; flex-direction: column; gap: 0.5rem; min-width: 250px ;
`;
const Label = styled.label` /* ...seus estilos... */  
  font-size: 0.9rem;  font-weight: 500; color: #374151;
`;
const StyledSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white; /* Fundo continua branco */
  color: #1f2937;        /* <<< ADICIONADO: Define a cor do texto para um tom escuro */
  min-width: 250px;

  &:focus {
    outline: none;
    border-color: #16a34a; /* Verde AgroView no foco */
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2); /* Sombra de foco verde clara */
  }

  /* Opcional: Estilizar as opções também, embora seja mais limitado entre navegadores */
  option {
    color: #1f2937; /* Garante que as opções também tenham texto escuro */
    background-color: white; /* Garante fundo branco para as opções */
  }
`;

const ToggleFormButton = styled.button` /* ...seus estilos... */ 
  background-color: #16a34a; color: white; padding: 0.65rem 1.25rem; border: none; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s ease; align-self: flex-end; margin-bottom: 0.05rem; &:hover { background-color: #12883e; } &:disabled { background-color: #9ca3af; cursor: not-allowed; } svg { stroke-width: 2.5px; }
`;
const DataDisplayGrid = styled.div` /* ...seus estilos... */ 
  display: grid; grid-template-columns: 1fr; gap: 2rem; @media (min-width: 1024px) { grid-template-columns: 1fr 1.5fr; }
`;
const Card = styled.div` /* ...seus estilos... */ 
  background-color: #fff; padding: 1.5rem; border-radius: 0.75rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;
const CardTitle = styled.h2` /* ...seus estilos... */ 
  font-size: 1.3rem; font-weight: 600; color: #005b4f; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;
`;
const ReadingsTable = styled.table` /* ...seus estilos... */ 
  width: 100%; border-collapse: collapse; th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; } th { color: #374151; font-weight: 600; background-color: #f9fafb; } tbody tr:hover { background-color: #f9fafb; }
`;
const AddReadingForm = styled(Card)` /* ...seus estilos... */ 
  margin-top: 2rem; max-width: 500px;
`;
const StyledForm = styled.form` /* ...seus estilos... */ 
  display: flex; flex-direction: column; gap: 1rem;
`;
const Input = styled.input` /* ...seus estilos... */ 
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; &:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2); }
`;
const SubmitButton = styled.button` /* ...seus estilos... */ 
  background-color: #16a34a; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; &:hover { background-color: #12883e; } &:disabled { background-color: #9ca3af; }
`;
const ErrorMessageForm = styled.p` /* ...seus estilos... */ 
  font-size: 0.75rem; color: #b91c1c; margin-top: 0.25rem;
`;
const LoadingOverlay = styled.div` /* ...seus estilos... */ 
  position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.8); display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:2000; svg { animation: spin 1s linear infinite; margin-bottom: 1rem; } p { font-weight: 500; color: #004d40; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
const ApiErrorMessage = styled.p` /* ...seus estilos... */ 
  color: #b91c1c; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 1rem; border-radius: 0.5rem; margin-bottom:1rem; text-align:center; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
`;


// --- Função de Formatação de Data ---
const formatReadingTimestamp = (isoTimestamp: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!isoTimestamp) return 'N/A';
  try {
    // Opções padrão para uma exibição completa de data e hora
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'America/Cuiaba', // IMPORTANTE: Ajuste para seu fuso horário local ou 'UTC'
    };
    return new Date(isoTimestamp).toLocaleString('pt-BR', options || defaultOptions);
  } catch (e) {
    console.error("Erro ao formatar timestamp:", isoTimestamp, e);
    return "Data Inválida";
  }
};

const formatTimestamp = (isoTimestamp: string | undefined | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!isoTimestamp) return 'N/A';
  try {
    // Opções padrão para uma exibição, você pode customizar ao chamar a função
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Cuiaba', // IMPORTANTE: Ajuste para seu fuso horário local ou desejado (ex: 'UTC')
    };
    return new Date(isoTimestamp).toLocaleString('pt-BR', options || defaultOptions);
  } catch (e) {
    console.error("Erro ao formatar timestamp:", isoTimestamp, e);
    return "Data Inválida";
  }
};


export default function SensorData() {
  const [availableSensors, setAvailableSensors] = useState<ISensorOption[]>([]);
  const [selectedSensorId, setSelectedSensorId] = useState<string>('');
  const [sensorReadings, setSensorReadings] = useState<ISensorDataReading[]>([]);
  const [isLoadingSensors, setIsLoadingSensors] = useState(true);
  const [isLoadingReadings, setIsLoadingReadings] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showAddReadingForm, setShowAddReadingForm] = useState(false);

  const { register, handleSubmit: handleAddReadingSubmit, reset: resetAddReadingForm, formState: { errors: addReadingErrors } } = useForm<AddReadingFormData>();

  const fetchUserSensors = useCallback(async () => {
    setIsLoadingSensors(true);
    setApiError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors`, { params: { userId: MOCK_USER_ID } });
      const sensorsWithOptions = response.data.map((s: any) => ({ id: s.id, name: s.name, type: s.type }));
      setAvailableSensors(sensorsWithOptions || []);
    } catch (error) {
      console.error("Erro ao buscar sensores do usuário:", error);
      setApiError("Não foi possível carregar a lista de sensores.");
      setAvailableSensors([]);
    } finally {
      setIsLoadingSensors(false);
    }
  }, []); 

  useEffect(() => {
    fetchUserSensors();
  }, [fetchUserSensors]);

  useEffect(() => {
    if (!selectedSensorId) {
      setSensorReadings([]);
      return;
    }
    const fetchReadings = async () => {
      setIsLoadingReadings(true);
      setApiError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/sensors/${selectedSensorId}/data`, {
          params: { limit: 100, orderBy: 'asc' } // <<< Busca em ordem ASCENDENTE para o gráfico
        });
        // Armazena o timestamp original (string ISO) e garante que 'value' seja número
        setSensorReadings(response.data.map((r: any) => ({
            ...r,
            id: Number(r.id),
            sensorId: Number(r.sensorId),
            value: Number(r.value),
            timestamp: r.timestamp // Mantém a string ISO original
        })) || []);
      } catch (error) {
        console.error(`Erro ao buscar dados para o sensor ${selectedSensorId}:`, error);
        setApiError(`Não foi possível carregar os dados para o sensor selecionado.`);
        setSensorReadings([]);
      } finally {
        setIsLoadingReadings(false);
      }
    };
    fetchReadings();
  }, [selectedSensorId]);

  const handleSensorSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSensorId(e.target.value);
    setShowAddReadingForm(false);
    resetAddReadingForm();
  };

  const onAddReading: SubmitHandler<AddReadingFormData> = async (data) => {
    if (!selectedSensorId) {
      setApiError("Selecione um sensor primeiro para adicionar uma leitura.");
      return;
    }
    setIsLoadingReadings(true);
    setApiError(null);
    try {
      const payload = {
        value: Number(data.value),
        timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : undefined,
      };
      await axios.post(`${API_BASE_URL}/sensors/${selectedSensorId}/data`, payload);
      resetAddReadingForm();
      setShowAddReadingForm(false);
      // Forçar re-busca das leituras para o sensor selecionado
      const currentId = selectedSensorId;
      setSelectedSensorId(''); 
      setTimeout(() => setSelectedSensorId(currentId), 0);
      
    } catch (error: any) {
      console.error("Erro ao adicionar leitura:", error);
      setApiError(error.response?.data?.error || "Falha ao adicionar leitura.");
    } finally {
      setIsLoadingReadings(false);
    }
  };
  
  const selectedSensorName = availableSensors.find(s => s.id === Number(selectedSensorId))?.name;
  const selectedSensorType = availableSensors.find(s => s.id === Number(selectedSensorId))?.type;
  const yAxisUnit = selectedSensorType?.toLowerCase().includes('temp') ? '°C' : 
                    selectedSensorType?.toLowerCase().includes('umid') ? '%' : '';


  if (isLoadingSensors && !availableSensors.length) {
    return <PageContainer><LoadingOverlay><FiLoader size={40} color="#16a34a" /><p>Carregando lista de sensores...</p></LoadingOverlay></PageContainer>;
  }

  return (
    <PageContainer>
      <Header>
        <FiDatabase size={36} color="#00796b" />
        <Title>Dados Históricos dos Sensores</Title>
      </Header>

      {apiError && <ApiErrorMessage><FiAlertCircle /> {apiError}</ApiErrorMessage>}

      <ControlRow>
        <SensorSelectGroup>
          <Label htmlFor="sensorSelect">Selecione um Sensor:</Label>
          <StyledSelect id="sensorSelect" value={selectedSensorId} onChange={handleSensorSelectChange}>
            <option value="" disabled>-- Escolha um sensor --</option>
            {availableSensors.map(sensor => (
              <option key={sensor.id} value={String(sensor.id)}>
                {sensor.name} ({sensor.type})
              </option>
            ))}
          </StyledSelect>
        </SensorSelectGroup>
        {selectedSensorId && (
             <ToggleFormButton onClick={() => {
                 setShowAddReadingForm(!showAddReadingForm);
                 if (!showAddReadingForm) { 
                    resetAddReadingForm(); 
                    setApiError(null); 
                 }
             }}>
                <FiPlus /> {showAddReadingForm ? 'Cancelar Leitura' : 'Adicionar Leitura'}
            </ToggleFormButton>
        )}
      </ControlRow>

      {selectedSensorId && showAddReadingForm && (
        <AddReadingForm>
          <CardTitle><FiPlus /> Adicionar Nova Leitura para "{selectedSensorName || 'Sensor'}"</CardTitle>
          <StyledForm onSubmit={handleAddReadingSubmit(onAddReading)}>
            <div>
              <Label htmlFor="value">Valor da Leitura</Label>
              <Input id="value" type="number" step="any" {...register('value', { required: "Valor é obrigatório", valueAsNumber: true })} />
              {addReadingErrors.value && <ErrorMessageForm>{addReadingErrors.value.message}</ErrorMessageForm>}
            </div>
            <div>
              <Label htmlFor="timestamp">Timestamp (Opcional - padrão: agora)</Label>
              <Input id="timestamp" type="datetime-local" {...register('timestamp')} />
            </div>
            <SubmitButton type="submit" disabled={isLoadingReadings}>
              {isLoadingReadings ? <><FiLoader style={{animation: 'spin 1s linear infinite'}}/> Salvando...</> : <><FiSave /> Salvar Leitura</>}
            </SubmitButton>
          </StyledForm>
        </AddReadingForm>
      )}

      {selectedSensorId && (
        isLoadingReadings ? (
          <div style={{textAlign: 'center', marginTop: '2rem'}}><FiLoader size={30} color="#16a34a" style={{animation: 'spin 1s linear infinite'}} /> <p>Carregando leituras...</p></div>
        ) : sensorReadings.length > 0 ? (
          <DataDisplayGrid>
            <Card>
              <CardTitle><FiList /> Últimas Leituras: {selectedSensorName || ''}</CardTitle>
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                <ReadingsTable>
                  <thead><tr><th>Data e Hora da Leitura</th><th>Valor</th></tr></thead>
                  <tbody>
                    {/* Mostrar as leituras mais recentes primeiro na tabela */}
                    {[...sensorReadings].reverse().map(reading => (
                      <tr key={reading.id}>
                        <td>{formatTimestamp(reading.timestamp)}</td>
                        <td>{reading.value.toFixed(2)} {yAxisUnit}</td>
                      </tr>
                    ))}
                  </tbody>
                </ReadingsTable>
              </div>
            </Card>
            <Card>
              <CardTitle><FiBarChart2 /> Histórico de Leituras: {selectedSensorName || ''}</CardTitle>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sensorReadings} margin={{ top: 5, right: 30, left: 0, bottom: 30 }}> {/* Ajuste de margens */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 10, fill: '#555' }}
                    tickFormatter={(isoTimestamp) => formatTimestamp(isoTimestamp, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    angle={-35}
                    textAnchor="end"
                    height={60} // Aumentar altura para labels angulados
                    interval="preserveStartEnd" // ou um número para controlar a densidade
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#555' }} unit={yAxisUnit} domain={['auto', 'auto']}/>
                  <Tooltip 
                    labelFormatter={(labelIsoTimestamp) => formatTimestamp(labelIsoTimestamp, {day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    formatter={(value: number) => [`${value.toFixed(2)} ${yAxisUnit}`, "Valor"]}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="value" name={selectedSensorName || "Valor"} stroke="#00796b" strokeWidth={2} activeDot={{ r: 6 }} dot={{r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </DataDisplayGrid>
        ) : (
          <Card style={{textAlign: 'center'}}>
            <CardTitle>Nenhuma Leitura Encontrada</CardTitle>
            <p>Não há dados de leitura para o sensor "{selectedSensorName || 'selecionado'}".</p>
            <p>Você pode adicionar leituras manualmente usando o botão acima, se desejar.</p>
          </Card>
        )
      )}
    </PageContainer>
  );
}
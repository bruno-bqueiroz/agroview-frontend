// src/pages/SensorData.tsx
import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import styled from 'styled-components';
import { api } from '../services/api'; // <<< Usando a instância 'api' configurada
import { useForm, SubmitHandler } from 'react-hook-form';
import { 
  FiActivity, FiDatabase, FiList, FiBarChart2, 
  FiPlus, FiLoader, FiAlertCircle, FiSave 
} from 'react-icons/fi';
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
  timestamp: string; // String ISO original do backend
}

interface AddReadingFormData {
  value: string; // Input type="number" pode retornar string, converteremos
  timestamp?: string; // Do input datetime-local (YYYY-MM-DDTHH:mm)
}

// --- Constantes ---
// API_BASE_URL é gerenciada pela instância 'api'
// MOCK_USER_ID não é mais necessário aqui para as chamadas principais

// --- Styled Components (COLE AQUI SUAS DEFINIÇÕES COMPLETAS) ---
// Certifique-se de que estas definições estão no seu arquivo e são únicas.
const PageContainer = styled.div`
  padding: 2rem;
  background-color: #f0fdf4;
  min-height: calc(100vh - 4rem); 
`;
const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 0.75rem;
`;
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #004d40;
`;
const ControlRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;
const SensorSelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 250px;
`;
const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
`;
const StyledSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background-color: white;
  color: #1f2937;
  min-width: 250px;
  &:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
  }
  option {
    color: #1f2937;
    background-color: white;
  }
`;
const ToggleFormButton = styled.button`
  background-color: #16a34a;
  color: white;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  align-self: flex-end; 
  margin-bottom: 0.05rem;
  &:hover {
    background-color: #12883e;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  svg {
    stroke-width: 2.5px;
  }
`;
const DataDisplayGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1.5fr; 
  }
`;
const Card = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;
const CardTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #005b4f;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const ReadingsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.9rem;
  }
  th {
    color: #374151;
    font-weight: 600;
    background-color: #f9fafb;
  }
  tbody tr:hover {
    background-color: #f9fafb;
  }
`;
const AddReadingForm = styled(Card)`
  margin-top: 2rem;
  max-width: 500px;
`;
const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const Input = styled.input`
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; color:white;
  &:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2); }
`;
const SubmitButton = styled.button`
  background-color: #16a34a; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  &:hover { background-color: #12883e; }
  &:disabled { background-color: #9ca3af; }
`;
const ErrorMessageForm = styled.p`
  font-size: 0.75rem; color: #b91c1c; margin-top: 0.25rem;
`;
const LoadingOverlay = styled.div`
  position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.8);
  display:flex; flex-direction:column; justify-content:center; align-items:center; z-index:2000;
  svg { animation: spin 1s linear infinite; margin-bottom: 1rem; }
  p { font-weight: 500; color: #004d40; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
const ApiErrorMessage = styled.p`
  color: #b91c1c; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 1rem;
  border-radius: 0.5rem; margin-bottom:1rem; text-align:center;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
`;

// --- Função de Formatação de Data Unificada ---
const formatDisplayTimestamp = (isoTimestamp?: string | null, options?: Intl.DateTimeFormatOptions): string => {
  if (!isoTimestamp) return 'N/A';
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Cuiaba', // Ajuste para seu fuso horário ou UTC
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

  const { register, handleSubmit: handleAddReadingSubmit, reset: resetAddReadingForm, formState: { errors: addReadingErrors } } = useForm<AddReadingFormData>({
    defaultValues: { value: '', timestamp: ''}
  });

  // Buscar lista de sensores do usuário para o dropdown
  const fetchUserSensors = useCallback(async () => {
    setIsLoadingSensors(true);
    setApiError(null);
    try {
      console.log("FRONTEND (SensorData.tsx): Buscando sensores do usuário (autenticado)...");
      const response = await api.get('/sensors'); // <<< USA 'api' e rota /sensors (backend pega userId do token)
      const sensorsWithOptions = response.data.map((s: any) => ({ 
        id: Number(s.id), 
        name: s.name, 
        type: s.type 
      }));
      setAvailableSensors(sensorsWithOptions || []);
      console.log("FRONTEND (SensorData.tsx): Sensores para dropdown carregados:", sensorsWithOptions);
    } catch (error: any) {
      console.error("FRONTEND (SensorData.tsx): Erro ao buscar sensores do usuário:", error);
      setApiError(error.response?.data?.error || "Não foi possível carregar a lista de sensores.");
      setAvailableSensors([]);
    } finally {
      setIsLoadingSensors(false);
    }
  }, []); 

  useEffect(() => {
    fetchUserSensors();
  }, [fetchUserSensors]);

  // Buscar leituras quando um sensor é selecionado
  useEffect(() => {
    if (!selectedSensorId) {
      setSensorReadings([]);
      return;
    }
    const fetchReadings = async () => {
      setIsLoadingReadings(true);
      setApiError(null);
      try {
        console.log(`FRONTEND (SensorData.tsx): Buscando leituras para sensor ID: ${selectedSensorId}`);
        const response = await api.get(`/sensors/${selectedSensorId}/data`, { // <<< USA 'api'
          params: { limit: 100, orderBy: 'asc' } 
        });
        console.log("FRONTEND (SensorData.tsx): Leituras recebidas:", response.data);
        setSensorReadings(response.data.map((r: any) => ({
            id: Number(r.id),
            sensorId: Number(r.sensorId),
            value: Number(r.value),
            timestamp: r.timestamp 
        })) || []);
      } catch (error: any) {
        console.error(`FRONTEND (SensorData.tsx): Erro ao buscar dados para o sensor ${selectedSensorId}:`, error);
        setApiError(error.response?.data?.error || `Não foi possível carregar os dados para o sensor selecionado.`);
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
    resetAddReadingForm({ value: '', timestamp: '' });
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
        value: parseFloat(data.value), // Usar parseFloat para permitir decimais
        timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : undefined,
      };
      console.log(`FRONTEND (SensorData.tsx): Enviando nova leitura para sensor ID ${selectedSensorId}:`, payload);
      await api.post(`/sensors/${selectedSensorId}/data`, payload); // <<< USA 'api'
      
      resetAddReadingForm({ value: '', timestamp: '' });
      setShowAddReadingForm(false);
      
      // Forçar re-busca das leituras para o sensor selecionado
      const currentId = selectedSensorId;
      setSelectedSensorId(''); 
      // Pequeno delay para permitir que o estado seja limpo antes de re-acionar o useEffect
      // Isso ajuda a garantir que o useEffect de buscar leituras seja acionado novamente.
      setTimeout(() => setSelectedSensorId(currentId), 0); 
      
    } catch (error: any) {
      console.error("FRONTEND (SensorData.tsx): Erro ao adicionar leitura:", error);
      setApiError(error.response?.data?.error || "Falha ao adicionar leitura.");
    } finally {
      setIsLoadingReadings(false);
    }
  };
  
  const selectedSensor = availableSensors.find(s => s.id === Number(selectedSensorId));
  const yAxisUnit = selectedSensor?.type?.toLowerCase().includes('temp') ? '°C' : 
                    selectedSensor?.type?.toLowerCase().includes('umid') ? '%' : '';


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
          <StyledSelect id="sensorSelect" value={selectedSensorId} onChange={handleSensorSelectChange} disabled={isLoadingSensors}>
            <option value="" disabled>-- {isLoadingSensors ? "Carregando..." : "Escolha um sensor"} --</option>
            {availableSensors.map(sensor => (
              <option key={sensor.id} value={String(sensor.id)}>
                {sensor.name} ({sensor.type})
              </option>
            ))}
          </StyledSelect>
        </SensorSelectGroup>
        {selectedSensorId && (
             <ToggleFormButton 
                onClick={() => {
                    setShowAddReadingForm(!showAddReadingForm);
                    if (!showAddReadingForm) { 
                        resetAddReadingForm({ value: '', timestamp: '' }); 
                        setApiError(null); 
                    }
                }}
                disabled={isLoadingReadings}
              >
                <FiPlus /> {showAddReadingForm ? 'Cancelar Leitura' : 'Adicionar Leitura'}
            </ToggleFormButton>
        )}
      </ControlRow>

      {selectedSensorId && showAddReadingForm && (
        <AddReadingForm>
          <CardTitle><FiPlus /> Adicionar Leitura para "{selectedSensor?.name || 'Sensor'}"</CardTitle>
          <StyledForm onSubmit={handleAddReadingSubmit(onAddReading)}>
            <div>
              <Label htmlFor="value">Valor da Leitura</Label>
              <Input id="value" type="number" step="any" {...register('value', { 
                  required: "Valor é obrigatório", 
                  validate: v => !isNaN(parseFloat(v)) || "Deve ser um número válido" // Validação para número
                })} 
              />
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
              <CardTitle><FiList /> Últimas Leituras: {selectedSensor?.name || ''}</CardTitle>
              <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                <ReadingsTable>
                  <thead><tr><th>Data e Hora da Leitura</th><th>Valor</th></tr></thead>
                  <tbody>
                    {[...sensorReadings].reverse().map(reading => (
                      <tr key={reading.id}>
                        <td>{formatDisplayTimestamp(reading.timestamp)}</td>
                        <td>{reading.value.toFixed(2)} {yAxisUnit}</td>
                      </tr>
                    ))}
                  </tbody>
                </ReadingsTable>
              </div>
            </Card>
            <Card>
              <CardTitle><FiBarChart2 /> Histórico de Leituras: {selectedSensor?.name || ''}</CardTitle>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={sensorReadings} margin={{ top: 5, right: 30, left: 0, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 10, fill: '#555' }}
                    tickFormatter={(isoTimestamp) => formatDisplayTimestamp(isoTimestamp, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    angle={-35} textAnchor="end" height={70} interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#555' }} unit={yAxisUnit} domain={['auto', 'auto']}/>
                  <Tooltip 
                    labelFormatter={(labelIsoTimestamp) => formatDisplayTimestamp(labelIsoTimestamp, {day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    formatter={(value: number) => [`${Number(value).toFixed(2)} ${yAxisUnit}`, "Valor"]}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '8px', borderColor: '#ddd' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="value" name={selectedSensor?.name || "Valor"} stroke="#00796b" strokeWidth={2} activeDot={{ r: 6 }} dot={{r:3}} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </DataDisplayGrid>
        ) : (
          <Card style={{textAlign: 'center', marginTop: '1rem'}}>
            <CardTitle>Nenhuma Leitura Encontrada</CardTitle>
            <p>Não há dados de leitura para o sensor "{selectedSensor?.name || 'selecionado'}".</p>
            { !showAddReadingForm && <p>Você pode adicionar leituras manualmente usando o botão "Adicionar Leitura" acima.</p>}
          </Card>
        )
      )}
      {!selectedSensorId && !isLoadingSensors && !apiError && ( // Mostrar se nenhum sensor selecionado e não carregando/erro
        <Card style={{textAlign: 'center', marginTop: '1rem'}}>
            <CardTitle>Nenhum Sensor Selecionado</CardTitle>
            <p>Por favor, escolha um sensor na lista acima para visualizar seus dados.</p>
        </Card>
      )}
    </PageContainer>
  );
}
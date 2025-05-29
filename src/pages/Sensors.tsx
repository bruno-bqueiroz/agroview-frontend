// src/pages/Sensors.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled from 'styled-components';
import axios from 'axios';
import {
  FiCpu, FiPlusCircle, FiTrash2, FiTag, FiMapPin,
  FiLoader, FiAlertCircle, FiHelpCircle, FiEdit3, FiSave // Adicionado FiEdit3, FiSave
} from 'react-icons/fi';

// --- Interfaces e Tipos ---
interface AreaOption {
  id: number;
  name: string;
}

interface ISensor {
  id: number;
  name: string;
  type: string;
  model: string | null;
  active: boolean;
  installedAt: string; // Esperamos YYYY-MM-DD ou string ISO do backend
  areaId: number | null;
  userId?: number | null;
  area?: {
    name: string;
  } | null;
}

// FormData para o sensor (usada para Adicionar e Editar)
type SensorFormData = {
  name: string;
  type: string;
  model: string; // Mesmo que opcional no backend, o form pode ter
  active: boolean;
  installedAt: string; // YYYY-MM-DD do input
  areaId: string; // Valor do select (string), converter para número ao enviar
};

// --- Constantes ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MOCK_USER_ID = 3;

// --- Styled Components (Mantenha todas as suas definições aqui) ---
// ... (COLE AQUI TODOS OS SEUS STYLED COMPONENTS COMPLET
// --- Componente Principal ---
export default function Sensors() {
  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [availableAreas, setAvailableAreas] = useState<AreaOption[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Renomeado de showAddForm
  const [editingSensor, setEditingSensor] = useState<ISensor | null>(null); // <<< NOVO ESTADO

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SensorFormData>({
    defaultValues: { name: '', type: '', model: '', active: true, installedAt: '', areaId: "" }
  });

  // Funções fetchAvailableAreas e fetchSensors (como na versão anterior)
  const fetchAvailableAreas = useCallback(async () => { /* ... (código da versão anterior) ... */ 
    try {
      const response = await axios.get(`${API_BASE_URL}/areas/user/${MOCK_USER_ID}`);
      setAvailableAreas(response.data || []);
    } catch (error) { console.error("Erro ao buscar áreas:", error); setAvailableAreas([]); setApiError(prev => prev ? `${prev}\nFalha ao carregar áreas.` : "Falha ao carregar áreas.");}
  }, []);

  const fetchSensors = useCallback(async () => { /* ... (código da versão anterior) ... */ 
    setApiError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/sensors`, { params: { userId: MOCK_USER_ID } });
      const fetchedSensors = response.data.map((sensor: any) => ({
        ...sensor, id: Number(sensor.id), model: sensor.model || null,
      }));
      setSensors(fetchedSensors);
    } catch (error) { console.error("Erro ao buscar sensores:", error); setSensors([]); setApiError(prev => prev ? `${prev}\nFalha ao carregar sensores.` : "Falha ao carregar sensores.");}
  }, []);

  useEffect(() => {
    setIsLoadingPage(true);
    Promise.all([fetchAvailableAreas(), fetchSensors()])
      .finally(() => setIsLoadingPage(false));
  }, [fetchAvailableAreas, fetchSensors]);


  const handleAddSensor = async (data: SensorFormData) => { // Já estava async
    setIsSubmitting(true);
    setApiError(null);
    try {
      const selectedAreaIdNum = data.areaId ? parseInt(data.areaId, 10) : null;
      if (selectedAreaIdNum === null) throw new Error("Área não selecionada");

      const payload = {
        name: data.name, type: data.type, model: data.model || null,
        active: data.active, installedAt: data.installedAt, // YYYY-MM-DD
        areaId: selectedAreaIdNum, userId: MOCK_USER_ID,
      };
      await axios.post(`${API_BASE_URL}/sensors`, payload);
      await fetchSensors(); // Re-busca a lista
      reset(); setShowForm(false);
    } catch (error: any) {
      console.error("Erro ao adicionar sensor:", error);
      setApiError(error.response?.data?.error || "Falha ao adicionar sensor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // <<< NOVA FUNÇÃO PARA ATUALIZAR SENSOR >>>
  const handleUpdateSensor = async (sensorId: number, data: SensorFormData) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const selectedAreaIdNum = data.areaId ? parseInt(data.areaId, 10) : null;
      if (selectedAreaIdNum === null) throw new Error("Área não selecionada para atualização");

      const payload = { // Envia apenas campos que podem ser atualizados
        name: data.name,
        type: data.type,
        model: data.model || null,
        active: data.active,
        installedAt: data.installedAt, // YYYY-MM-DD
        areaId: selectedAreaIdNum,
        // userId não é atualizado aqui, é definido na criação
      };
      await axios.put(`${API_BASE_URL}/sensors/${sensorId}`, payload);
      await fetchSensors(); // Re-busca a lista
      reset();
      setShowForm(false);
      setEditingSensor(null); // Limpa estado de edição
    } catch (error: any) {
      console.error("Erro ao atualizar sensor:", error);
      setApiError(error.response?.data?.error || "Falha ao atualizar sensor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSensor = async (sensorId: number) => { // Já estava async
    if (!window.confirm(`Tem certeza que deseja remover o sensor ID: ${sensorId}?`)) return;
    setIsSubmitting(true); // Usar isSubmitting para indicar operação na lista
    setApiError(null);
    try {
      await axios.delete(`${API_BASE_URL}/sensors/${sensorId}`);
      await fetchSensors(); // Re-busca a lista
    } catch (error: any) {
      console.error("Erro ao remover sensor:", error);
      setApiError(error.response?.data?.error || "Falha ao remover sensor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // <<< NOVA FUNÇÃO PARA INICIAR EDIÇÃO >>>
  const handleStartEdit = (sensor: ISensor) => {
    setEditingSensor(sensor);
    // Popula o formulário. A data 'installedAt' do backend (ISO string) precisa ser formatada para YYYY-MM-DD
    // para o input type="date".
    const installedDate = sensor.installedAt ? sensor.installedAt.substring(0, 10) : '';
    reset({
      name: sensor.name,
      type: sensor.type,
      model: sensor.model || '',
      active: sensor.active,
      installedAt: installedDate,
      areaId: sensor.areaId ? String(sensor.areaId) : "", // areaId para string para o select
    });
    setShowForm(true);
    setApiError(null); // Limpa erros anteriores ao abrir o form para edição
  };

  // Função unificada para submit do formulário
  const onFormSubmit: SubmitHandler<SensorFormData> = (data) => {
    if (editingSensor) {
      handleUpdateSensor(editingSensor.id, data);
    } else {
      handleAddSensor(data);
    }
  };
  
  const handleToggleForm = () => {
    setShowForm(!showForm);
    setEditingSensor(null); // Limpa edição se estava editando
    reset({ name: '', type: '', model: '', active: true, installedAt: '', areaId: "" }); // Reseta para valores de adição
    setApiError(null);
  };

  const formatDate = (dateStringISO: string) => { /* ... (como antes) ... */ 
    if (!dateStringISO) return 'N/A';
    try { return new Date(dateStringISO).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }); }
    catch (e) { return "Data inválida"; }
  };

  if (isLoadingPage && !showForm && !sensors.length) {
    return ( <PageContainer><LoadingOverlay><FiLoader size={40} color="#16a34a" /><p>Carregando dados...</p></LoadingOverlay></PageContainer> );
  }

  return (
    <PageContainer>
      <Header>
        <Title><FiCpu /> Gerenciamento de Sensores</Title>
        <ToggleFormButton onClick={handleToggleForm} disabled={isLoadingPage && !showForm}>
          {showForm ? (editingSensor ? <FiEdit3 /> : <FiPlusCircle />) : <FiPlusCircle />} 
          {showForm ? 'Cancelar' : 'Adicionar Sensor'}
        </ToggleFormButton>
      </Header>

      {apiError && <ApiErrorMessage><FiAlertCircle /> {apiError}</ApiErrorMessage>}

      {showForm && (
        <FormContainer>
          <FormTitle>
            {editingSensor ? <><FiEdit3 size={28}/> Editar Sensor</> : <><FiPlusCircle size={28}/> Novo Sensor</>}
          </FormTitle>
          <StyledForm onSubmit={handleSubmit(onFormSubmit)}> {/* ATUALIZADO */}
            {/* Campos do formulário com tooltips (Nome, Tipo, Modelo, Área, Data, Ativo) - como na versão anterior */}
            {/* Nome */}
            <FormGroup>
              <LabelWithTooltipContainer>
                <Label htmlFor="name">Nome do Sensor</Label>
                <TooltipWrapper><TooltipIcon size={16} /><TooltipText>Identificador. Ex: "Termômetro Estufa A"</TooltipText></TooltipWrapper>
              </LabelWithTooltipContainer>
              <Input id="name" {...register('name', { required: "Nome é obrigatório" })} />
              {errors.name && <ErrorMessageForm>{errors.name.message}</ErrorMessageForm>}
            </FormGroup>
            {/* Tipo */}
            <FormGroup>
              <LabelWithTooltipContainer>
                <Label htmlFor="type">Tipo</Label>
                <TooltipWrapper><TooltipIcon size={16} /><TooltipText>O que mede. Ex: "Temperatura", "Umidade"</TooltipText></TooltipWrapper>
              </LabelWithTooltipContainer>
              <Input id="type" {...register('type', { required: "Tipo é obrigatório" })} />
              {errors.type && <ErrorMessageForm>{errors.type.message}</ErrorMessageForm>}
            </FormGroup>
            {/* Modelo */}
            <FormGroup>
              <LabelWithTooltipContainer>
                <Label htmlFor="model">Modelo</Label>
                <TooltipWrapper><TooltipIcon size={16} /><TooltipText>Modelo/fabricante. Ex: "DHT22"</TooltipText></TooltipWrapper>
              </LabelWithTooltipContainer>
              <Input id="model" {...register('model')} />
            </FormGroup>
            {/* Área Associada */}
            <FormGroup>
              <LabelWithTooltipContainer>
                <Label htmlFor="areaId">Área Associada</Label>
                <TooltipWrapper><TooltipIcon size={16} /><TooltipText>Selecione a área de instalação.</TooltipText></TooltipWrapper>
              </LabelWithTooltipContainer>
              <StyledSelect id="areaId" {...register('areaId', { validate: value => (value !== "" && value !== null) || "Selecione uma área" })} defaultValue="">
                <option value="" disabled>Selecione uma área...</option>
                {availableAreas.map(area => (<option key={area.id} value={String(area.id)}>{area.name}</option>))}
              </StyledSelect>
              {errors.areaId && <ErrorMessageForm>{errors.areaId.message}</ErrorMessageForm>}
            </FormGroup>
            {/* Data de Instalação */}
            <FormGroup>
              <LabelWithTooltipContainer>
                <Label htmlFor="installedAt">Data de Instalação</Label>
                <TooltipWrapper><TooltipIcon size={16} /><TooltipText>Início da operação.</TooltipText></TooltipWrapper>
              </LabelWithTooltipContainer>
              <Input id="installedAt" type="date" {...register('installedAt', { required: "Data é obrigatória" })}/>
              {errors.installedAt && <ErrorMessageForm>{errors.installedAt.message}</ErrorMessageForm>}
            </FormGroup>
            {/* Sensor Ativo */}
            <FormGroup className="full-width">
              <LabelWithTooltipContainer>
                <Label htmlFor="active" style={{ marginBottom: 0, cursor: 'pointer' }}>Sensor Ativo</Label>
                <TooltipWrapper><TooltipIcon size={16} /><TooltipText>Indica se está operacional.</TooltipText></TooltipWrapper>
              </LabelWithTooltipContainer>
              <CheckboxContainer style={{marginTop: '-0.25rem'}}>
                <StyledCheckbox id="active" {...register('active')} />
              </CheckboxContainer>
            </FormGroup>
            <SubmitButtonForm type="submit" disabled={isSubmitting || isLoadingPage} className="full-width-button">
              {isSubmitting ? <><FiLoader size={18} style={{animation: 'spin 1s linear infinite'}}/> Salvando...</> 
                           : editingSensor ? <><FiSave /> Salvar Alterações</> 
                                           : <><FiPlusCircle /> Adicionar Sensor</>}
            </SubmitButtonForm>
          </StyledForm>
        </FormContainer>
      )}

      <SensorListContainer>
        {!showForm && <SensorListTitle>Sensores Cadastrados ({sensors.length})</SensorListTitle>}
        {sensors.length > 0 ? (
          <SensorListUl>
            {sensors.map(sensor => (
              <SensorItemLi key={sensor.id}>
                <SensorHeader>
                  <SensorName><FiCpu /> {sensor.name}</SensorName>
                  <StatusBadge $active={sensor.active}>{sensor.active ? 'Ativo' : 'Inativo'}</StatusBadge>
                </SensorHeader>
                <SensorDetails>
                  <SensorInfo><FiTag /> Tipo: {sensor.type}</SensorInfo>
                  <SensorInfo><FiTag /> Modelo: {sensor.model || 'N/A'}</SensorInfo>
                  <SensorInfo><FiMapPin /> Área: {sensor.area?.name || (sensor.areaId ? `ID ${sensor.areaId}`: 'N/A')}</SensorInfo>
                  <SensorInfo>Instalado em: {formatDate(sensor.installedAt)}</SensorInfo>
                </SensorDetails>
                <SensorActions>
                  {/* BOTÃO DE EDITAR */}
                  <ActionButton variant="edit" onClick={() => handleStartEdit(sensor)} disabled={isSubmitting || isLoadingPage}>
                    <FiEdit3 /> Editar
                  </ActionButton>
                  <RemoveButton onClick={() => handleRemoveSensor(sensor.id)} disabled={isSubmitting || isLoadingPage}>
                    <FiTrash2 />
                  </RemoveButton>
                </SensorActions>
              </SensorItemLi>
            ))}
          </SensorListUl>
        ) : (
          !showForm && !isLoadingPage && !apiError && <p>Nenhum sensor encontrado.</p>
        )}
      </SensorListContainer>
    </PageContainer>
  );
}





// --- Styled Components (COLE AQUI TODOS OS SEUS STYLED COMPONENTS da última versão com tooltips) ---
// Vou adicionar placeholders para os principais. Certifique-se de ter as definições completas.
const PageContainer = styled.div`
  padding: 2rem;
  background-color: #f0fdf4;
  min-height: calc(100vh - 4rem); 
`;
const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #004d40;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;
const ToggleFormButton = styled.button`
  background-color: #16a34a;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
  &:hover { background-color: #12883e; }
  svg { stroke-width: 2.5px; }
`;
const FormContainer = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;
const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #005b4f;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const StyledForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
`;
const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;
const LabelWithTooltipContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem; 
`;
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex; 
  align-items: center;
`;
const TooltipIcon = styled(FiHelpCircle)`
  cursor: help;
  color: #6b7280; 
  margin-left: 8px; 
  &:hover + div { display: block; opacity: 1; visibility: visible; }
`;
const TooltipText = styled.div`
  display: none; opacity: 0; visibility: hidden; position: absolute; bottom: 130%; left: 50%;
  transform: translateX(-50%); background-color: #374151; color: white; padding: 0.6rem 0.8rem;
  border-radius: 0.375rem; font-size: 0.8rem; line-height: 1.4; white-space: pre-wrap; 
  width: max-content; max-width: 280px; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
  &::after { content: ''; position: absolute; top: 100%; left: 50%; margin-left: -6px;
    border-width: 6px; border-style: solid; border-color: #374151 transparent transparent transparent; }
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  &.full-width { @media (min-width: 768px) { grid-column: span 2; } }
`;
const Input = styled.input`
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem;
  color: #d1d5db; transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2); }
  &::placeholder { color: #9ca3af; }
`;
const StyledSelect = styled.select`
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem;
  color: #1f2937; background-color: white; transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2); }
`;
const CheckboxContainer = styled.div`
  display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; 
`;
const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1.15rem; height: 1.15rem; border-radius: 0.25rem; border: 1px solid #d1d5db; cursor: pointer;
  accent-color: #16a34a;
  &:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2); }
`;
const SubmitButtonForm = styled(ToggleFormButton)`
  width: auto; min-width: 180px; justify-content: center; margin-top: 0.5rem;
  background-color: #00796b;
  &:hover { background-color: #005b4f; }
  &.full-width-button { @media (min-width: 768px) { grid-column: span 2; justify-self: start; } }
`;
const ErrorMessageForm = styled.p`
  font-size: 0.75rem; color: #b91c1c; margin-top: 0.25rem;
`;
const SensorListContainer = styled.div` margin-top: 2rem; `;
const SensorListTitle = styled.h2`
  font-size: 1.5rem; font-weight: 600; color: #004d40; margin-bottom: 1.5rem;
`;
const SensorListUl = styled.ul`
  list-style: none; padding: 0; margin: 0; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;
`;
const SensorItemLi = styled.li`
  background-color: #ffffff; padding: 1.25rem 1.5rem; border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07); display: flex; flex-direction: column;
  gap: 0.75rem; border-left: 4px solid #00796b;
`;
const SensorHeader = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
`;
const SensorName = styled.h3`
  font-size: 1.15rem; font-weight: 600; color: #1f2937; margin: 0;
  display: flex; align-items: center; gap: 0.5rem; svg { color: #00796b; }
`;
const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;
  color: #fff; background-color: ${props => (props.$active ? '#10b981' : '#ef4444')}; white-space: nowrap;
`;
const SensorDetails = styled.div`
  display: flex; flex-direction: column; gap: 0.5rem;
`;
const SensorInfo = styled.p`
  font-size: 0.9rem; color: #4b5563; margin: 0; display: flex; align-items: center; gap: 0.5rem;
  svg { color: #6b7280; stroke-width: 2px; font-size: 1em; }
`;
const SensorActions = styled.div`
  margin-top: 1rem; display: flex; justify-content: flex-end;
`;
const RemoveButton = styled.button`
  background-color: transparent; color: #ef4444; padding: 0.5rem; border-radius: 0.375rem;
  display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 500;
  &:hover { background-color: #fee2e2; color: #b91c1c; }
  svg { stroke-width: 2px; }
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
const ActionButton = styled.button<{ variant?: 'danger' | 'edit' }>`/* Adicione este styled component se não existir */
  background-color: transparent; border: none; 
  color: ${props => props.variant === 'danger' ? '#ef4444' : props.variant === 'edit' ? '#3b82f6' : '#6b7280'}; 
  padding: 0.5rem; border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; 
  gap: 0.3rem; font-size: 0.8rem; font-weight: 500;
  &:hover { background-color: ${props => props.variant === 'danger' ? '#fee2e2' : props.variant === 'edit' ? '#dbeafe' : '#f3f4f6'}; }
  svg { stroke-width: 2px; }
`; 

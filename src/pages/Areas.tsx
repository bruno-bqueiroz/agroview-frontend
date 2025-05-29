// src/pages/Areas.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled from 'styled-components';
import axios from 'axios';
import { FiMapPin, FiPlusSquare, FiTrash2, FiEdit3, FiLoader, FiAlertCircle, FiSave, FiTag } from 'react-icons/fi'; // Adicionado FiEdit3 e FiSave

// --- Interfaces ---
interface Area {
  id: number;
  name: string;
  areaType: string;
  geom?: any;
  userId?: number;
}

interface AreaFormData { // Usada tanto para criar quanto para atualizar
  name: string;
  areaType: string;
  geom?: any; // Opcional
}

// --- Constantes ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const MOCK_USER_ID = 3;


// --- Componente Areas ---
export default function Areas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false); // Renomeado de showAddForm
  const [editingArea, setEditingArea] = useState<Area | null>(null); // <<< NOVO ESTADO PARA EDIÇÃO

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AreaFormData>({
    defaultValues: { name: '', areaType: '' } // Valores padrão para o formulário
  });

  const fetchAreas = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/areas/user/${MOCK_USER_ID}`);
      setAreas(response.data);
    } catch (error) {
      console.error("Erro ao buscar áreas:", error);
      setApiError("Não foi possível carregar as áreas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleAddArea = async (data: AreaFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const payload = { ...data, userId: MOCK_USER_ID };
      await axios.post(`${API_BASE_URL}/areas`, payload);
      fetchAreas();
      reset({ name: '', areaType: '' }); // Limpa para o formulário
      setShowForm(false);
    } catch (error: any) {
      console.error("Erro ao adicionar área:", error);
      setApiError(error.response?.data?.error || "Falha ao adicionar área.");
    } finally {
      setIsLoading(false);
    }
  };

  // <<< NOVA FUNÇÃO PARA ATUALIZAR ÁREA >>>
  const handleUpdateArea = async (areaId: number, data: AreaFormData) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // O backend espera apenas os campos que podem ser atualizados (name, areaType, geom)
      const payload: AreaFormData = {
        name: data.name,
        areaType: data.areaType,
        // geom: data.geom // Se você tiver o campo geom no formulário
      };
      await axios.put(`${API_BASE_URL}/areas/${areaId}`, payload);
      fetchAreas(); // Re-busca para atualizar a lista
      reset({ name: '', areaType: '' });
      setShowForm(false);
      setEditingArea(null); // Limpa o estado de edição
    } catch (error: any) {
      console.error("Erro ao atualizar área:", error);
      setApiError(error.response?.data?.error || "Falha ao atualizar área.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveArea = async (areaId: number) => {
    if (!window.confirm("Tem certeza que deseja remover esta área? Os sensores associados podem ser afetados.")) return;
    setIsLoading(true);
    setApiError(null);
    try {
      await axios.delete(`${API_BASE_URL}/areas/${areaId}`);
      fetchAreas();
    } catch (error) {
      console.error("Erro ao remover área:", error);
      setApiError("Não foi possível remover a área.");
    } finally {
      setIsLoading(false);
    }
  };

  // <<< FUNÇÃO PARA INICIAR A EDIÇÃO >>>
  const handleEditArea = (area: Area) => {
    setEditingArea(area);
    setValue('name', area.name); // Popula o formulário com os dados da área
    setValue('areaType', area.areaType);
    // setValue('geom', area.geom || ''); // Se tiver campo geom
    setShowForm(true); // Mostra o formulário
  };

  // Função chamada pelo submit do formulário
  const onFormSubmit: SubmitHandler<AreaFormData> = (data) => {
    if (editingArea) {
      handleUpdateArea(editingArea.id, data);
    } else {
      handleAddArea(data);
    }
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    setEditingArea(null); // Limpa o estado de edição ao abrir/fechar form pelo botão principal
    reset({ name: '', areaType: '' }); // Reseta o formulário
  }

  return (
    <PageContainer>
      {isLoading && <LoadingOverlay><FiLoader size={40} color="#16a34a" /></LoadingOverlay>}
      
      <Header>
        <Title><FiMapPin /> Áreas Monitoradas</Title>
        <ToggleFormButton onClick={handleToggleForm}>
          {showForm ? (editingArea ? <FiEdit3 /> : <FiPlusSquare />) : <FiPlusSquare />} 
          {showForm ? 'Cancelar' : 'Adicionar Área'}
        </ToggleFormButton>
      </Header>

      {apiError && <ApiErrorMessage><FiAlertCircle /> {apiError}</ApiErrorMessage>}

      {showForm && (
        <FormContainer>
          <FormTitle>
            {editingArea ? <><FiEdit3 size={28}/> Editar Área</> : <><FiPlusSquare size={28}/> Nova Área</>}
          </FormTitle>
          <StyledForm onSubmit={handleSubmit(onFormSubmit)}> {/* Atualizado para onFormSubmit */}
            <FormGroup>
              <Label htmlFor="name">Nome da Área</Label>
              <Input id="name" {...register('name', { required: 'Nome da área é obrigatório' })}/>
              {errors.name && <ErrorMessageForm>{errors.name.message}</ErrorMessageForm>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="areaType">Tipo da Área</Label>
              <Input id="areaType" {...register('areaType', { required: 'Tipo da área é obrigatório' })}/>
              {errors.areaType && <ErrorMessageForm>{errors.areaType.message}</ErrorMessageForm>}
            </FormGroup>
            
            <SubmitButtonForm type="submit" disabled={isLoading}>
              {isLoading ? <><FiLoader size={18} style={{animation: 'spin 1s linear infinite'}}/> Salvando...</> 
                         : editingArea ? <><FiSave /> Salvar Alterações</> 
                                       : <><FiPlusSquare /> Adicionar Área</>}
            </SubmitButtonForm>
          </StyledForm>
        </FormContainer>
      )}

      <AreaListContainer>
        {areas.length === 0 && !showForm && !isLoading && !apiError && (
          <p>Nenhuma área cadastrada para este usuário. Clique em "Adicionar Área" para começar.</p>
        )}
        {areas.length > 0 && (
          <AreaList>
            {areas.map(area => (
              <AreaCard key={area.id}>
                <AreaName><FiMapPin /> {area.name}</AreaName>
                <AreaInfo><FiTag /> Tipo: {area.areaType}</AreaInfo>
                <AreaActions>
                  <ActionButton variant="edit" onClick={() => handleEditArea(area)} disabled={isLoading}>
                    <FiEdit3 /> Editar
                  </ActionButton>
                  <ActionButton variant="danger" onClick={() => handleRemoveArea(area.id)} disabled={isLoading}>
                    <FiTrash2 /> Remover
                  </ActionButton>
                </AreaActions>
              </AreaCard>
            ))}
          </AreaList>
        )}
      </AreaListContainer>
    </PageContainer>
  );
}



// --- Styled Components (mantendo os da versão anterior) ---
// PageContainer, Header, Title, AddAreaButton, FormContainer, FormTitle,
// StyledForm, FormGroup, Label, Input, ErrorMessageForm, SubmitButton (será ajustado),
// AreaListContainer, AreaList, AreaCard, AreaName, AreaInfo, AreaActions, ActionButton,
// LoadingOverlay, ApiErrorMessage - Cole seus styled components aqui
// Vou colar alguns essenciais e os que precisam de ajuste:
const PageContainer = styled.div` /* ...seus estilos... */ 
  padding: 2rem; background-color: #f0fdf4; min-height: calc(100vh - 4rem);
`;
const Header = styled.header` /* ...seus estilos... */ 
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;
`;
const Title = styled.h1` /* ...seus estilos... */ 
  font-size: 2rem; font-weight: 700; color: #004d40; display: flex; align-items: center; gap: 0.75rem;
`;
const ToggleFormButton = styled.button` // Renomeado de AddAreaButton para ser mais genérico
  background-color: #16a34a; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s ease;
  &:hover { background-color: #12883e; }
  svg { stroke-width: 2.5px; }
`;
const FormContainer = styled.div` /* ...seus estilos... */ 
  background-color: #fff; padding: 2rem; border-radius: 0.75rem; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); margin-bottom: 2rem;
`;
const FormTitle = styled.h2` /* ...seus estilos... */ 
  font-size: 1.5rem; font-weight: 600; color: #005b4f; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;
`;
const StyledForm = styled.form` /* ...seus estilos... */ 
  display: flex; flex-direction: column; gap: 1rem;
`;
const FormGroup = styled.div` /* ...seus estilos... */ `;
const Label = styled.label` /* ...seus estilos... */ 
  display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;
`;
const Input = styled.input` /* ...seus estilos... */ 
  width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; color: #d1d5db; transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2); }
`;
const ErrorMessageForm = styled.p` /* ...seus estilos... */ 
  font-size: 0.75rem; color: #b91c1c; margin-top: 0.25rem;
`;
const SubmitButtonForm = styled(ToggleFormButton)` // Reutilizando o estilo do botão
  width: 100%; justify-content: center; margin-top: 0.5rem;
  background-color: ${props => props.disabled ? '#ccc' : '#00796b'}; // Cor diferente para submit, ou ajuste
  &:hover {
    background-color: ${props => props.disabled ? '#ccc' : '#005b4f'};
  }
`;
const AreaListContainer = styled.div` /* ...seus estilos... */ `;
const AreaList = styled.ul` /* ...seus estilos... */ 
  list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;
`;
const AreaCard = styled.li` /* ...seus estilos... */ 
  background-color: #ffffff; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.07); display: flex; flex-direction: column; gap: 0.5rem; border-left: 4px solid #16a34a;
`;
const AreaName = styled.h3` /* ...seus estilos... */ 
  font-size: 1.2rem; font-weight: 600; color: #1f2937; margin: 0; display: flex; align-items: center; gap: 0.5rem; svg { color: #16a34a; }
`;
const AreaInfo = styled.p` /* ...seus estilos... */ 
  font-size: 0.9rem; color: #4b5563; margin: 0; display: flex; align-items: center; gap: 0.5rem; svg { color: #6b7280; }
`;
const AreaActions = styled.div` /* ...seus estilos... */ 
  margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;
`;
const ActionButton = styled.button<{ variant?: 'danger' | 'edit' }>` /* ...seus estilos... */ 
  background-color: transparent; border: none; color: ${props => props.variant === 'danger' ? '#ef4444' : props.variant === 'edit' ? '#3b82f6' : '#6b7280'}; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 500;
  &:hover { background-color: ${props => props.variant === 'danger' ? '#fee2e2' : props.variant === 'edit' ? '#dbeafe' : '#f3f4f6'}; }
  svg { stroke-width: 2px; }
`;
const LoadingOverlay = styled.div` /* ...seus estilos... */ 
  position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,0.7); display:flex; justify-content:center; align-items:center; z-index:2000;
  svg { animation: spin 1s linear infinite; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
const ApiErrorMessage = styled.p` /* ...seus estilos... */ 
  color: #b91c1c; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 1rem; border-radius: 0.5rem; margin-bottom:1rem; text-align:center;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
`;


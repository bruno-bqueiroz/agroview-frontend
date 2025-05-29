// src/pages/Areas.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled from 'styled-components';
import { FiMapPin, FiPlusSquare, FiTrash2, FiEdit3, FiTag } from 'react-icons/fi'; // Ícones relevantes

// --- Interfaces ---
interface Area {
  id: number;
  name: string;
  areaType: string;
}

interface AreaFormData {
  name: string;
  areaType: string;
}

// --- Dados Mockados Iniciais ---
const initialAreas: Area[] = [
  { id: 1, name: 'Talhão Norte', areaType: 'Cultivo de Milho' },
  { id: 2, name: 'Estufa Principal', areaType: 'Hortaliças' },
  { id: 3, name: 'Reservatório Leste', areaType: 'Armazenamento de Água' },
];



// --- Componente Areas ---
export default function Areas() {
  const [areas, setAreas] = useState<Area[]>(initialAreas);
  const [showAddForm, setShowAddForm] = useState(false); // Para controlar visibilidade do form

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AreaFormData>();

  const handleAddArea: SubmitHandler<AreaFormData> = (data) => {
    const newArea: Area = {
      id: Date.now(), // Usando timestamp como ID para mock (não ideal para produção)
      name: data.name,
      areaType: data.areaType,
    };
    setAreas(prevAreas => [newArea, ...prevAreas]);
    reset(); // Limpa o formulário
    setShowAddForm(false); // Esconde o formulário após adicionar
  };

  const handleRemoveArea = (areaId: number) => {
    setAreas(prevAreas => prevAreas.filter(area => area.id !== areaId));
  };

  return (
    <PageContainer>
      <Header>
        <Title><FiMapPin /> Áreas Monitoradas</Title>
        <AddAreaButton onClick={() => setShowAddForm(!showAddForm)}>
          <FiPlusSquare /> {showAddForm ? 'Cancelar' : 'Adicionar Área'}
        </AddAreaButton>
      </Header>

      {showAddForm && (
        <FormContainer>
          <FormTitle><FiPlusSquare /> Nova Área</FormTitle>
          <StyledForm onSubmit={handleSubmit(handleAddArea)}>
            <FormGroup>
              <Label htmlFor="name">Nome da Área</Label>
              <Input
                id="name"
                type="text"
                {...register('name', { required: 'Nome da área é obrigatório' })}
                placeholder="Ex: Talhão Sul, Estufa Principal"
              />
              {errors.name && <ErrorMessageForm>{errors.name.message}</ErrorMessageForm>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="areaType">Tipo da Área</Label>
              <Input
                id="areaType"
                type="text"
                {...register('areaType', { required: 'Tipo da área é obrigatório' })}
                placeholder="Ex: Cultivo de Soja, Horta, Pomar"
              />
              {errors.areaType && <ErrorMessageForm>{errors.areaType.message}</ErrorMessageForm>}
            </FormGroup>
            <SubmitButton type="submit">
              <FiPlusSquare /> Salvar Área
            </SubmitButton>
          </StyledForm>
        </FormContainer>
      )}

      <AreaListContainer>
        {areas.length === 0 && !showAddForm ? (
          <p>Nenhuma área cadastrada ainda. Clique em "Adicionar Área" para começar.</p>
        ) : (
          <AreaList>
            {areas.map(area => (
              <AreaCard key={area.id}>
                <AreaName><FiMapPin /> {area.name}</AreaName>
                <AreaInfo><FiTag /> Tipo: {area.areaType}</AreaInfo>
                {/* Adicionar mais infos se desejar, ex: area.location */}
                <AreaActions>
                  {/* <ActionButton variant="edit" onClick={() => console.log('Editar area', area.id)}>
                    <FiEdit3 /> Editar
                  </ActionButton> */}
                  <ActionButton variant="danger" onClick={() => handleRemoveArea(area.id)}>
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


// --- Styled Components (inspirados em Sensors.tsx e adaptados) ---
const PageContainer = styled.div`
  padding: 2rem;
  background-color: #f0fdf4; // Mesma cor de fundo do MainContent do Sidebar
  min-height: calc(100vh - 4rem); // Ajustar se o padding do MainContent for diferente
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
  color: #004d40; // Verde escuro
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AddAreaButton = styled.button`
  background-color: #16a34a; // Verde AgroView
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

  &:hover {
    background-color: #12883e;
  }

  svg {
    stroke-width: 2.5px;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr; // Uma coluna por padrão
  gap: 2rem;

  @media (min-width: 1024px) {
    // Ex: formulário à esquerda, lista à direita, ou conforme preferir
    // grid-template-columns: 350px 1fr; 
  }
`;

const FormContainer = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: ##d1d5db;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
  }
`;

const ErrorMessageForm = styled.p`
  font-size: 0.75rem;
  color: #b91c1c;
  margin-top: 0.25rem;
`;

const SubmitButton = styled(AddAreaButton)` // Reutilizando o estilo do botão
  width: 100%;
  justify-content: center;
  margin-top: 0.5rem;
`;

const AreaListContainer = styled.div`
  // background-color: #fff;
  // padding: 1rem;
  // border-radius: 0.75rem;
  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const AreaList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const AreaCard = styled.li`
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-left: 4px solid #16a34a; // Destaque verde
`;

const AreaName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg { color: #16a34a; }
`;

const AreaInfo = styled.p`
  font-size: 0.9rem;
  color: #4b5563;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg { color: #6b7280; }
`;

const AreaActions = styled.div`
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ variant?: 'danger' | 'edit' }>`
  background-color: transparent;
  border: none;
  color: ${props => props.variant === 'danger' ? '#ef4444' : props.variant === 'edit' ? '#3b82f6' : '#6b7280'};
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.8rem;
  font-weight: 500;

  &:hover {
    background-color: ${props => props.variant === 'danger' ? '#fee2e2' : props.variant === 'edit' ? '#eff6ff': '#f3f4f6'};
  }
  svg { stroke-width: 2px; }
`;
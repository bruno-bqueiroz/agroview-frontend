// src/pages/Sensors.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import styled from 'styled-components';
import { FiCpu, FiPlusCircle, FiTrash2 } from 'react-icons/fi'; // Ícones para sensores, adicionar e remover

// --- Interfaces e Tipos ---
interface ISensor {
  id: string;
  name: string;
  type: string;
  model: string;
  active: boolean;
  installedAt: string; // Data como string (YYYY-MM-DD)
}

type SensorFormData = Omit<ISensor, 'id'>;

// --- Mock Data Inicial ---
const initialSensors: ISensor[] = [
  { id: '1', name: 'Sensor de Temperatura A', type: 'Temperatura', model: 'DHT22', active: true, installedAt: '2024-05-15' },
  { id: '2', name: 'Sensor de Umidade do Solo B', type: 'Umidade Solo', model: 'YL-69', active: false, installedAt: '2024-03-10' },
  { id: '3', name: 'Sensor de Chuva C', type: 'Pluviômetro', model: 'Rainsensor-X', active: true, installedAt: '2024-01-20' },
];




// --- Componente Principal ---
export default function Sensors() {
  const [sensors, setSensors] = useState<ISensor[]>(initialSensors);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SensorFormData>();

  const handleAddSensor: SubmitHandler<SensorFormData> = (data) => {
    const newSensor: ISensor = {
      id: Date.now().toString(), // ID simples para o exemplo
      ...data,
    };
    setSensors(prevSensors => [newSensor, ...prevSensors]); // Adiciona no início da lista
    reset(); // Limpa o formulário
  };

  const handleRemoveSensor = (sensorId: string) => {
    setSensors(prevSensors => prevSensors.filter(sensor => sensor.id !== sensorId));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', { // Adiciona T00:00:00 para evitar problemas de fuso
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <PageContainer>
      <Header>
        <StyledSensorIcon />
        <Title>Gerenciamento de Sensores</Title>
      </Header>

      <ContentWrapper>
        <FormContainer>
          <FormTitle>
            <FiPlusCircle size={28} /> Adicionar Novo Sensor
          </FormTitle>
          <StyledForm onSubmit={handleSubmit(handleAddSensor)}>
            <FormGroup>
              <Label htmlFor="name">Nome do Sensor</Label>
              <StyledInput
                id="name"
                placeholder="Ex: Sensor de Temperatura da Estufa"
                {...register('name', { required: "Nome é obrigatório" })}
              />
              {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="type">Tipo</Label>
              <StyledInput
                id="type"
                placeholder="Ex: Temperatura, Umidade, pH"
                {...register('type', { required: "Tipo é obrigatório" })}
              />
              {errors.type && <ErrorMessage>{errors.type.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="model">Modelo</Label>
              <StyledInput
                id="model"
                placeholder="Ex: DHT22, YL-69"
                {...register('model', { required: "Modelo é obrigatório" })}
              />
              {errors.model && <ErrorMessage>{errors.model.message}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="installedAt">Data de Instalação</Label>
              <StyledInput
                id="installedAt"
                type="date"
                {...register('installedAt', { required: "Data de instalação é obrigatória" })}
              />
              {errors.installedAt && <ErrorMessage>{errors.installedAt.message}</ErrorMessage>}
            </FormGroup>

            <FormGroup className="full-width"> {/* Ocupa a linha toda no grid de 2 colunas */}
              <CheckboxContainer>
                <StyledCheckbox
                  id="active"
                  {...register('active')}
                />
                <Label htmlFor="active" style={{ marginBottom: 0, cursor: 'pointer' }}>Sensor Ativo</Label>
              </CheckboxContainer>
            </FormGroup>
            
            <SubmitButton type="submit" className="full-width-button">
              <FiPlusCircle size={18} /> Adicionar Sensor
            </SubmitButton>
          </StyledForm>
        </FormContainer>

        <SensorListContainer>
          <SensorListTitle>Sensores Cadastrados ({sensors.length})</SensorListTitle>
          {sensors.length > 0 ? (
            <SensorListUl>
              {sensors.map(sensor => (
                <SensorItemLi key={sensor.id}>
                  <SensorInfo>
                    <strong>{sensor.name}</strong>
                    <span>Modelo: {sensor.model} | Tipo: {sensor.type}</span>
                    <span>Instalado em: {formatDate(sensor.installedAt)}</span>
                  </SensorInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge $active={sensor.active}>
                      {sensor.active ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                    <RemoveButton
                      onClick={() => handleRemoveSensor(sensor.id)}
                      title="Remover Sensor"
                    >
                      <FiTrash2 />
                    </RemoveButton>
                  </div>
                </SensorItemLi>
              ))}
            </SensorListUl>
          ) : (
            <p>Nenhum sensor cadastrado ainda.</p>
          )}
        </SensorListContainer>
      </ContentWrapper>
    </PageContainer>
  );
}





// --- Styled Components (adaptados e novos) ---
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #e0f2f7, #f0fdf4, #e6fffa); /* Tom azulado/esverdeado claro */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 2rem; /* Espaço entre header, formulário e lista */
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 800px; /* Ajuste conforme necessário */
`;

const StyledSensorIcon = styled(FiCpu)`
  color: #00796b; /* Verde escuro/azul petróleo para o ícone principal */
  margin-right: 0.75rem;
  font-size: 40px;

  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #004d40; /* Verde bem escuro para o título */

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const ContentWrapper = styled.main`
  width: 100%;
  max-width: 800px; /* Consistente com o header */
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Estilos para o formulário (reutilizando e adaptando do Login)
const FormContainer = styled.div`
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 5px 10px -5px rgba(0,0,0,0.04);
  width: 100%;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #004d40;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StyledForm = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; /* Duas colunas em telas maiores */
    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  /* Para campos que ocupam a linha inteira no grid de 2 colunas */
  &.full-width {
    @media (min-width: 768px) {
      grid-column: span 2;
    }
  }
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const StyledInput = styled.input`
  padding: 0.75rem;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #00796b;
    box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.2);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const StyledSelect = styled.select`
  padding: 0.75rem;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 0.9rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #00796b;
    box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.2);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem; /* Para alinhar melhor com outros labels */
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  accent-color: #00796b; /* Cor do check */

  &:focus {
    outline: none;
    border-color: #00796b;
    box-shadow: 0 0 0 3px rgba(0, 121, 107, 0.2);
  }
`;

const SubmitButton = styled.button`
  width: auto; /* Ajuste para não ocupar a largura total automaticamente */
  min-width: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  color: #fff;
  font-weight: 500;
  background-color: #00796b; /* Cor principal */
  transition: background-color 0.2s ease-in-out;
  font-size: 0.9rem;

  &:hover {
    background-color: #004d40; /* Mais escuro no hover */
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Para o botão ocupar a linha inteira no grid de 2 colunas */
  &.full-width-button {
     @media (min-width: 768px) {
      grid-column: span 2;
      justify-self: start; /* Alinha o botão à esquerda */
    }
  }
`;

const ErrorMessage = styled.p`
  font-size: 0.75rem;
  color: #b91c1c; /* Vermelho para erros */
  margin-top: 0.125rem;
`;

// Estilos para a lista de sensores
const SensorListContainer = styled.div`
  width: 100%;
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 5px 10px -5px rgba(0,0,0,0.04);
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const SensorListTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #004d40;
  margin-bottom: 1.5rem;
`;

const SensorListUl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SensorItemLi = styled.li`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap; /* Para responsividade do conteúdo interno */

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 4px -1px rgba(0,0,0,0.06), 0 2px 2px -1px rgba(0,0,0,0.03);
  }
`;

const SensorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1; /* Para ocupar o espaço disponível */

  strong {
    color: #1f2937;
  }
  span {
    font-size: 0.875rem;
    color: #4b5563;
  }
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 0.25rem 0.6rem;
  border-radius: 9999px; /* Pill shape */
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  background-color: ${props => (props.$active ? '#10b981' : '#ef4444')}; /* Verde para ativo, Vermelho para inativo */
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  color: #ef4444; /* Vermelho */
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #fee2e2; /* Fundo vermelho claro */
    color: #b91c1c; /* Vermelho mais escuro */
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
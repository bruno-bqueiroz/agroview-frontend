// src/pages/Areas.tsx
import styled from 'styled-components';
import { FaMapMarkerAlt } from 'react-icons/fa';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom right, #dcfce7, #f0fdf4, #d1fae5);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const StyledFaMap = styled(FaMapMarkerAlt)`
  color: #16a34a;
  margin-right: 0.75rem;
  font-size: 40px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
`;

const AreaCard = styled.div`
  background-color: #fff;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 500px;
  margin-top: 1rem;
`;

export default function Areas() {
  return (
    <PageContainer>
      <Header>
        <StyledFaMap />
        <Title>Áreas Monitoradas</Title>
      </Header>

      <AreaCard>
        <h2>Talhão 1</h2>
        <p>Tipo: Plantio</p>
        <p>Localização: Coordenadas XYZ</p>
      </AreaCard>
    </PageContainer>
  );
}

// src/pages/Login.tsx

import React, { useState, FormEvent } from 'react'; // Removido ChangeEvent e MouseEvent se não usados diretamente nas props
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import styled from 'styled-components';

// --- Definições de Styled Components ---

const PageContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom right, #dcfce7, #f0fdf4, #d1fae5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const LoginBox = styled.div`
  background-color: #fff;
  padding: 2rem; // Padding para telas menores
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  width: 100%;
  max-width: 28rem; // Max-width para telas menores

  & > * + * {
    margin-top: 1.5rem;
  }

  // Estilos para telas maiores (desktop/notebook)
  @media (min-width: 768px) {
    padding: 2.5rem; // Padding maior
    max-width: 32rem; // Max-width um pouco maior
  }

  @media (min-width: 1024px) {
    padding: 3rem; // Padding ainda maior para telas bem grandes
    max-width: 34rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem; 
`;

const StyledFaLeaf = styled(FaLeaf)`
  color: #16a34a;
  margin-right: 0.75rem;
  font-size: 48px; // Tamanho base

  @media (min-width: 768px) {
    font-size: 56px; // Maior em telas maiores
  }
`;

const LogoText = styled.h1`
  font-size: 2.25rem; // text-4xl base
  font-weight: 700;
  color: #1f2937;

  @media (min-width: 768px) {
    font-size: 2.5rem; // Maior em telas maiores
  }
`;

const LogoHighlight = styled.span`
  color: #16a34a;
`;

const AlertMessage = styled.div<{ type: 'error' | 'success' }>`
  padding: 1rem;
  border-radius: 0.25rem;
  color: ${(props) => (props.type === 'error' ? '#b91c1c' : '#15803d')};
  background-color: ${(props) => (props.type === 'error' ? '#fee2e2' : '#dcfce7')};
  font-size: 0.875rem; // text-sm

  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StyledForm = styled.form`
  & > * + * {
    margin-top: 1rem;
  }
`;

const FormGroup = styled.div`
  /* Container para label e input field */
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem; // text-sm
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;

  @media (min-width: 768px) {
    font-size: 0.95rem; // Levemente maior
  }
`;

const InputContainer = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;

  svg { // Para dimensionar o ícone dentro do InputIcon
    font-size: 20px; // Tamanho base do ícone
    @media (min-width: 768px) {
      font-size: 22px; // Levemente maior
    }
  }
`;

const StyledInput = styled.input`
  
  padding-left: 2.75rem; // Ajustado para ícone um pouco maior
  padding-right: 0.75rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 0.9rem; // Tamanho base

  &:focus {
    outline: none;
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
  }

  &::placeholder {
    color: #9ca3af;
  }

  @media (min-width: 768px) {
    font-size: 1rem; // Tamanho padrão em telas maiores
    padding-top: 0.85rem;
    padding-bottom: 0.85rem;
    padding-left: 3rem; // Ajustado para ícone maior
  }
`;

const PasswordInput = styled(StyledInput)`
  padding-right: 2.75rem; // Ajustado para ícone um pouco maior

   @media (min-width: 768px) {
    padding-right: 3rem; // Ajustado para ícone maior
  }
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex; // Para alinhar o ícone
  align-items: center; // Para alinhar o ícone

  &:hover {
    color: #16a34a;
  }

  svg { // Para dimensionar o ícone dentro do botão
    font-size: 20px; // Tamanho base do ícone
    @media (min-width: 768px) {
      font-size: 22px; // Levemente maior
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: #fff;
  font-weight: 500;
  background-color: #16a34a;
  transition: background-color 0.2s ease-in-out;
  border: none;
  cursor: pointer;
  font-size: 0.9rem; // Tamanho base

  &:hover {
    background-color: #15803d;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 768px) {
    font-size: 1rem; // Tamanho padrão em telas maiores
    padding: 0.85rem 1rem;
  }
`;

const HelperText = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #4b5563;

  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StyledLink = styled.a`
  color: #16a34a;
  text-decoration: none;

  &:hover {
    color: #22c55e;
    text-decoration: underline;
  }
`;

// --- Tipo FormData ---
type FormData = {
  email: string;
  password: string;
};

// --- Componente Login ---
export default function Login() {
  const { register, handleSubmit, formState: { errors: formErrors } } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setApiError(null);
    setSuccess(null);

    console.log(data);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (data.email === 'usuario@agroview.com' && data.password === 'senha123') {
      setSuccess('Login bem-sucedido!');
    } else {
      setApiError('Email ou senha inválidos.');
    }

    setIsLoading(false);
  };

  return (
    <PageContainer>
      <LoginBox>
        <LogoContainer>
          <StyledFaLeaf /> {/* Usa o componente estilizado para o ícone */}
          <LogoText>
            Agro<LogoHighlight>View</LogoHighlight>
          </LogoText>
        </LogoContainer>

        {apiError && <AlertMessage type="error">{apiError}</AlertMessage>}
        {success && <AlertMessage type="success">{success}</AlertMessage>}
        
        {formErrors.email && <AlertMessage type="error">{formErrors.email.message || "Email é obrigatório."}</AlertMessage>}
        {formErrors.password && <AlertMessage type="error">{formErrors.password.message || "Senha é obrigatória."}</AlertMessage>}

        <StyledForm onSubmit={handleSubmit(onSubmit)}>
        
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputContainer>
              <InputIcon>
                <FiMail /> {/* Ícone dimensionado pelo CSS em InputIcon > svg */}
              </InputIcon>
              <StyledInput
                id="email"
                type="email"
                {...register('email', { required: "Email é obrigatório" })}
                placeholder="seuemail@exemplo.com"
              />
            </InputContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Senha</Label>
            <InputContainer>
              <InputIcon>
                <FiLock /> {/* Ícone dimensionado pelo CSS em InputIcon > svg */}
              </InputIcon>
              <PasswordInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: "Senha é obrigatória" })}
                placeholder="Sua senha"
              />
              <PasswordToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <FiEyeOff /> {/* Ícone dimensionado pelo CSS em PasswordToggleButton > svg */}
              </PasswordToggleButton>
            </InputContainer>
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </SubmitButton>
        </StyledForm>

        <HelperText>
          Ainda não tem uma conta?{' '}
          <StyledLink href="#">
            Crie uma agora
          </StyledLink>
        </HelperText>
      </LoginBox>
    </PageContainer>
  );
}
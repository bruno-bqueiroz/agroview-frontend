// src/pages/Login.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom'; // Importa como alias

// --- Styled Components ---
// (Cole aqui todos os seus styled-components que já definimos para esta página:
// PageContainer, LoginBox, LogoContainer, StyledFaLeaf, LogoText, LogoHighlight,
// AlertMessage, StyledForm, FormGroup, Label, InputContainer, InputIcon,
// StyledInput, PasswordInput, PasswordToggleButton, SubmitButton, HelperText,
// StyledLink, ErrorMessageForm)
// Para este exemplo, vou adicionar alguns essenciais para o contexto:

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom right, #dcfce7, #f0fdf4, #d1fae5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const LoginBox = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  width: 100%;
  max-width: 28rem;

  & > * + * {
    margin-top: 1.5rem;
  }

  @media (min-width: 768px) {
    padding: 2.5rem;
    max-width: 32rem;
  }

  @media (min-width: 1024px) {
    padding: 3rem;
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
  font-size: 48px;
  @media (min-width: 768px) {
    font-size: 56px;
  }
`;

const LogoText = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
  @media (min-width: 768px) {
    font-size: 2.5rem;
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
  font-size: 0.875rem;
  line-height: 1.25;
  text-align: center;
  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StyledForm = styled.form`
  & > * + * {
    margin-top: 1rem;
  }
`;

const FormGroup = styled.div``;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

const InputContainer = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
  pointer-events: none;
  svg {
    width: 20px;
    height: 20px;
    @media (min-width: 768px) {
      width: 22px;
      height: 22px;
    }
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  font-size: 0.9rem;
  color: #1f2937;
  background-color: #fff;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &::placeholder {
    color: #9ca3af;
    opacity: 1;
  }
  &:focus {
    outline: none;
    border-color: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
  }
  @media (min-width: 768px) {
    font-size: 1rem;
    padding-top: 0.85rem;
    padding-bottom: 0.85rem;
    padding-left: 3rem;
  }
`;

const PasswordInput = styled(StyledInput)`
  padding-right: 2.75rem;
  @media (min-width: 768px) {
    padding-right: 3rem;
  }
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  &:hover {
    color: #16a34a;
  }
  svg {
    width: 20px;
    height: 20px;
    @media (min-width: 768px) {
      width: 22px;
      height: 22px;
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
  font-size: 0.9rem;
  &:hover {
    background-color: #12883e;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  @media (min-width: 768px) {
    font-size: 1rem;
    padding: 0.85rem 1rem;
  }
`;

const HelperText = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #4b5563;
  margin-top: 1.5rem;
  @media (min-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StyledLink = styled.a`
  color: #16a34a;
  font-weight: 500;
  text-decoration: none;
  &:hover {
    color: #12883e;
    text-decoration: underline;
  }
`;

const ErrorMessageForm = styled.p`
  font-size: 0.75rem;
  color: #b91c1c;
  margin-top: 0.25rem;
`;


// --- Tipo FormData ---
interface LoginFormInputs {
  email: string;
  password: string;
}

const StyledRouterDomLink = styled(RouterLink)`
  color: #16a34a;
  font-weight: 500;
  text-decoration: none;
  &:hover {
    color: #12883e;
    text-decoration: underline;
  }
`;

// --- Componente Login ---
export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors: formErrors } } = useForm<LoginFormInputs>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setApiError(null);

    // Definindo a URL da API diretamente, usando o fallback caso import.meta.env.VITE_API_URL não esteja definido
    // Como você pediu para deixar sem o .env por enquanto, import.meta.env.VITE_API_URL será undefined,
    // e o fallback 'http://localhost:3001' será usado.
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/users/login`;
    
    console.log("FRONTEND: Tentando chamar API em:", apiUrl); // Para depuração

    try {
      const response = await axios.post(
        apiUrl,
        {
          email: data.email,
          password: data.password, // O backend espera 'password_provided'
        }
      );

      console.log("Resposta do login:", response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        console.log("Usuário logado:", response.data.user);
        navigate('/dashboard');
      } else {
        setApiError("Resposta inesperada do servidor.");
      }

    } catch (error: any) {
      console.error("Erro no login:", error);
      if (axios.isAxiosError(error) && error.response) {
        setApiError(error.response.data.error || "Falha no login. Verifique suas credenciais.");
      } else {
        // O erro "ReferenceError: process is not defined" cairia aqui antes da correção.
        // Agora, se o servidor estiver offline, este será o erro mostrado.
        setApiError("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginBox>
        <LogoContainer>
          <StyledFaLeaf />
          <LogoText>
            Agro<LogoHighlight>View</LogoHighlight>
          </LogoText>
        </LogoContainer>

        {apiError && <AlertMessage type="error">{apiError}</AlertMessage>}
        
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputContainer>
              <InputIcon>
                <FiMail />
              </InputIcon>
              <StyledInput
                id="email"
                type="email"
                {...register('email', { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Endereço de email inválido"
                  }
                })}
                placeholder="seuemail@exemplo.com"
                autoComplete="email"
              />
            </InputContainer>
            {formErrors.email && <ErrorMessageForm>{formErrors.email.message}</ErrorMessageForm>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Senha</Label>
            <InputContainer>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <PasswordInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', { 
                  required: "Senha é obrigatória",
                  minLength: {
                    value: 6,
                    message: "Senha deve ter pelo menos 6 caracteres"
                  }
                })}
                placeholder="Sua senha"
                autoComplete="current-password"
              />
              <PasswordToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggleButton>
            </InputContainer>
            {formErrors.password && <ErrorMessageForm>{formErrors.password.message}</ErrorMessageForm>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </SubmitButton>
        </StyledForm>

        <HelperText>
          Ainda não tem uma conta?{' '}
          <StyledRouterDomLink to="/register">
            Crie uma agora
          </StyledRouterDomLink>
        </HelperText>
        <HelperText style={{marginTop: '0.5rem'}}>
          <StyledLink href="#"> {/* Idealmente <Link to="/forgot-password"> */}
            Esqueceu a senha?
          </StyledLink>
        </HelperText>
      </LoginBox>
    </PageContainer>
  );
}
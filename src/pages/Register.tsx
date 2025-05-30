// src/pages/Register.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa'; // Reutilizando o logo

// --- Constantes ---
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// --- Interfaces ---
// Os campos aqui devem corresponder ao que o backend espera para registro
// e incluir campos extras do formulário como 'confirmPassword'
type RegisterFormInputs = {
  name: string;
  email: string;
  password_provided: string; // Nome diferente para evitar conflito com 'password' do HTML
  confirmPassword: string;
  phone?: string;
};

// --- Styled Components (Muitos podem ser reutilizados/adaptados do Login.tsx) ---
// Cole aqui os styled-components relevantes como PageContainer, FormBox (similar ao LoginBox),
// LogoContainer, StyledFaLeaf, LogoText, StyledForm, FormGroup, Label, Input,
// InputContainer, InputIcon, PasswordToggleButton, SubmitButton, AlertMessage, HelperText, StyledRouterLink (novo para Link do router)
// ErrorMessageForm.
// Vou adicionar definições básicas, ajuste ou use as suas existentes.

const PageContainer = styled.div`
  min-height: 100vh; width: 100vw;
  background: linear-gradient(to bottom right, #dcfce7, #f0fdf4, #d1fae5);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
`;

const FormBox = styled.div` // Similar ao LoginBox
  background-color: #fff; padding: 2rem; border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  width: 100%; max-width: 30rem; // Um pouco mais largo para mais campos
  & > * + * { margin-top: 1.25rem; } // Espaçamento interno
  @media (min-width: 768px) { padding: 2.5rem; max-width: 34rem; }
`;

const LogoContainer = styled.div` /* ... seu estilo ... */ 
  display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;
`;
const StyledFaLeaf = styled(FaLeaf)` /* ... seu estilo ... */ 
  color: #16a34a; margin-right: 0.75rem; font-size: 48px;
`;
const LogoText = styled.h1` /* ... seu estilo ... */ 
  font-size: 2.25rem; font-weight: 700; color: #1f2937;
`;
const LogoHighlight = styled.span` color: #16a34a; `;

const StyledForm = styled.form` & > * + * { margin-top: 1rem; } `;
const FormGroup = styled.div` position: relative; /* Para o PasswordToggleButton e InputIcon */ `;
const Label = styled.label` /* ... seu estilo ... */ 
  display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.5rem;
`;
const InputContainer = styled.div` position: relative; `;
const InputIcon = styled.div` /* ... seu estilo ... */ 
  position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: #9ca3af; display: flex; align-items: center; pointer-events: none;
  svg { width: 20px; height: 20px; }
`;
const Input = styled.input` /* ... seu estilo ... */ 
  width: 100%; padding: 0.75rem; padding-left: 2.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem;
  &:focus { outline: none; border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2); }
`;
const PasswordInput = styled(Input)` padding-right: 2.75rem; `;
const PasswordToggleButton = styled.button` /* ... seu estilo ... */ 
  position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); padding: 0.25rem; color: #6b7280; display: flex; align-items: center;
  &:hover { color: #16a34a; } svg { width: 20px; height: 20px; }
`;
const SubmitButton = styled.button` /* ... seu estilo ... */ 
  width: 100%; display: flex; justify-content: center; align-items: center; padding: 0.75rem 1rem; border-radius: 0.5rem; color: #fff; font-weight: 500; background-color: #16a34a; transition: background-color 0.2s ease-in-out; font-size: 0.9rem;
  &:hover { background-color: #12883e; } &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const AlertMessage = styled.div<{ type: 'error' | 'success' }>` /* ... seu estilo ... */ 
  padding: 1rem; border-radius: 0.25rem;
  color: ${(props) => (props.type === 'error' ? '#b91c1c' : '#15803d')};
  background-color: ${(props) => (props.type === 'error' ? '#fee2e2' : '#dcfce7')};
  font-size: 0.875rem; line-height: 1.25; text-align: center; display:flex; align-items:center; justify-content:center; gap: 0.5rem;
`;
const HelperText = styled.p` /* ... seu estilo ... */ 
  text-align: center; font-size: 0.875rem; color: #4b5563;
`;
const StyledRouterLink = styled(Link)` // Para o Link do react-router-dom
  color: #16a34a; font-weight: 500; text-decoration: none;
  &:hover { color: #12883e; text-decoration: underline; }
`;
const ErrorMessageForm = styled.p` /* ... seu estilo ... */ 
  font-size: 0.75rem; color: #b91c1c; margin-top: 0.25rem;
`;


export default function Register() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>({
    mode: "onBlur" // Valida ao sair do campo
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValue = watch("password_provided"); // Observa o valor da senha para validação de confirmação

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password_provided, // O backend espera 'password'
      phone: data.phone || undefined, // Envia undefined se vazio, para ser opcional
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/users`, payload); // Seu endpoint de registro
      console.log("Resposta do registro:", response.data);
      setSuccessMessage("Cadastro realizado com sucesso! Você será redirecionado para o login.");
      setTimeout(() => {
        navigate('/'); // Redireciona para a página de login após um breve delay
      }, 2000);
    } catch (error: any) {
      console.error("Erro no registro:", error);
      if (axios.isAxiosError(error) && error.response) {
        setApiError(error.response.data.error || "Falha no cadastro. Verifique os dados ou tente um email diferente.");
      } else {
        setApiError("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormBox>
        <LogoContainer>
          <StyledFaLeaf />
          <LogoText>Agro<LogoHighlight>View</LogoHighlight></LogoText>
        </LogoContainer>
        <h2 style={{ textAlign: 'center', color: '#005b4f', marginBottom: '1.5rem' }}>Criar Nova Conta</h2>

        {apiError && <AlertMessage type="error"><FiAlertCircle /> {apiError}</AlertMessage>}
        {successMessage && <AlertMessage type="success"><FiCheckCircle /> {successMessage}</AlertMessage>}
        
        <StyledForm onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label htmlFor="name">Nome Completo</Label>
            <InputContainer>
              <InputIcon><FiUser /></InputIcon>
              <Input id="name" type="text" {...register('name', { required: "Nome é obrigatório" })} />
            </InputContainer>
            {errors.name && <ErrorMessageForm>{errors.name.message}</ErrorMessageForm>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <InputContainer>
              <InputIcon><FiMail /></InputIcon>
              <Input id="email" type="email" {...register('email', { 
                  required: "Email é obrigatório",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email inválido" }
              })} />
            </InputContainer>
            {errors.email && <ErrorMessageForm>{errors.email.message}</ErrorMessageForm>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password_provided">Senha</Label>
            <InputContainer>
              <InputIcon><FiLock /></InputIcon>
              <PasswordInput id="password_provided" type={showPassword ? 'text' : 'password'} {...register('password_provided', { 
                  required: "Senha é obrigatória",
                  minLength: { value: 6, message: "Senha deve ter no mínimo 6 caracteres" }
              })} />
              <PasswordToggleButton type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggleButton>
            </InputContainer>
            {errors.password_provided && <ErrorMessageForm>{errors.password_provided.message}</ErrorMessageForm>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <InputContainer>
              <InputIcon><FiLock /></InputIcon>
              <PasswordInput id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword', { 
                  required: "Confirmação de senha é obrigatória",
                  validate: value => value === passwordValue || "As senhas não coincidem"
              })} />
              <PasswordToggleButton type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggleButton>
            </InputContainer>
            {errors.confirmPassword && <ErrorMessageForm>{errors.confirmPassword.message}</ErrorMessageForm>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Telefone (Opcional)</Label>
            <InputContainer>
              <InputIcon><FiPhone /></InputIcon>
              <Input id="phone" type="tel" {...register('phone')} />
            </InputContainer>
            {errors.phone && <ErrorMessageForm>{errors.phone.message}</ErrorMessageForm>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? <><FiLoader style={{animation: 'spin 1s linear infinite'}}/> Registrando...</> : "Criar Conta"}
          </SubmitButton>
        </StyledForm>

        <HelperText>
          Já tem uma conta?{' '}
          <StyledRouterLink to="/">Faça Login</StyledRouterLink>
        </HelperText>
      </FormBox>
    </PageContainer>
  );
}
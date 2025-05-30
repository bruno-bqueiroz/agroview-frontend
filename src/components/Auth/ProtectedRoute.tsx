// src/components/Auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  // Você pode adicionar mais props se precisar, como papéis de usuário (roles) no futuro
  // children?: React.ReactNode; // Se você preferir passar o componente como children em vez de usar <Outlet />
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('authToken'); // Verifica se o token existe

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login
    // Passamos o `location` atual para que, após o login, o usuário possa ser
    // redirecionado de volta para a página que estava tentando acessar (opcional).
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Se estiver autenticado, renderiza o conteúdo da rota aninhada (as páginas protegidas)
  // Se você estiver usando este componente para envolver rotas filhas definidas no App.tsx, use <Outlet />
  return <Outlet />;
  // Alternativamente, se você passar o componente como children:
  // return <>{children}</>; 
};

export default ProtectedRoute;
// src/services/api.ts
import axios from 'axios';

// A baseURL vem do .env (VITE_API_URL), ou usamos o padrão localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({ // Mantendo 'api' como você nomeou
  baseURL,
});

// --- ADICIONAR ESTE INTERCEPTOR DE REQUISIÇÃO ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Pega o token do localStorage
    if (token) {
      // Se o token existir, adiciona ao cabeçalho Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Retorna a configuração modificada (ou original se não houver token)
  },
  (error) => {
    // Faz algo com o erro da requisição
    return Promise.reject(error);
  }
);
// --- FIM DO INTERCEPTOR DE REQUISIÇÃO ---


// --- OPCIONAL: INTERCEPTOR DE RESPOSTA PARA ERROS 401 ---
// Este interceptor pode ajudar a lidar com tokens expirados ou inválidos globalmente.
api.interceptors.response.use(
  (response) => response, // Simplesmente retorna a resposta se for bem-sucedida
  (error) => {
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      // Se o backend retornar 401 (Não Autorizado)
      console.error("API Interceptor: Erro 401 - Token inválido ou expirado. Limpando token.");
      localStorage.removeItem('authToken'); // Limpa o token localmente

      // Redirecionar para a página de login.
      // Para evitar problemas com o hook useNavigate fora de componentes,
      // a abordagem mais robusta é o ProtectedRoute verificar o token
      // e redirecionar. Se a página não recarregar automaticamente,
      // o usuário será pego pelo ProtectedRoute na próxima tentativa de navegação.
      // window.location.href = '/'; // Descomente se quiser um redirecionamento forçado imediato
                                   // (mas isso recarrega a página inteira)
    }
    return Promise.reject(error); // Importante repassar o erro para ser tratado localmente também
  }
);
// --- FIM DO INTERCEPTOR DE RESPOSTA OPCIONAL ---

// Não precisa exportar apiClient se você já exporta 'api'
// export default apiClient; // Remova se você exporta 'api'
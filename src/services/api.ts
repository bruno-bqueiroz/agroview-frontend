// src/services/api.ts
import axios from 'axios';

// A baseURL vem do .env (VITE_API_URL), ou usamos o padrão localhost
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL });

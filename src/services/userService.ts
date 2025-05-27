// src/services/userService.ts
import { api } from './api';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/**
 * Chama POST /users no nosso backend.
 */
export async function createUser(data: CreateUserDTO) {
  const response = await api.post('/users', data);
  return response.data;
}

import { api } from "@/services/api"
export const loginApi = async (email: string, password: string) => {
  // CORRECT: No /api at the start, because baseURL already has it
  const response = await api.post('/auth/login', { email, password })
  return response.data
}


// Usa a variável de ambiente do Vite ou fallback para localhost:3001
// Fix: Cast import.meta to any to resolve the TypeScript error when accessing Vite environment variables
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  async get(endpoint: string) {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro na requisição');
    }
    return res.json();
  },

  async post(endpoint: string, body: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro na requisição');
    }
    return res.json();
  },

  async put(endpoint: string, body: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro na requisição');
    }
    return res.json();
  }
};

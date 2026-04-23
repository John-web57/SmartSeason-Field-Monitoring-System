import axios, { AxiosInstance } from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const apiBaseUrl = configuredBaseUrl
  ? `${configuredBaseUrl.replace(/\/+$/, '')}/api`
  : '/api';

const client: AxiosInstance = axios.create({
  baseURL: apiBaseUrl
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: (email: string, password: string, name: string, role?: string) =>
    client.post('/auth/register', { email, password, name, role }),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  getProfile: () => client.get('/auth/profile'),

  // Fields
  getAllFields: () => client.get('/fields'),
  getFieldsByAgent: () => client.get('/fields/my-fields'),
  getField: (id: number) => client.get(`/fields/${id}`),
  searchFields: (query: string, filters?: any) =>
    client.get('/fields/search', { params: { q: query, ...filters } }),
  createField: (data: any) => client.post('/fields', data),
  updateField: (id: number, data: any) => client.patch(`/fields/${id}`, data),
  cloneField: (id: number, newName: string, plantingDate?: string) =>
    client.post(`/fields/${id}/clone`, { newName, plantingDate }),
  recordHarvest: (id: number, yield_value: number, harvestDate?: string) =>
    client.post(`/fields/${id}/harvest`, { yield: yield_value, harvestDate }),
  addFieldUpdate: (fieldId: number, data: any) =>
    client.post(`/fields/${fieldId}/updates`, data),
  getAllUpdates: () => client.get('/fields/updates/all'),
  getStatistics: () => client.get('/fields/statistics'),
  getAtRiskFields: () => client.get('/fields/at-risk'),
  getFieldStatusDetails: (id: number) => client.get(`/fields/status/${id}`),

  // Agents
  getAllAgents: () => client.get('/agents'),
  getAgentDetails: (id: number) => client.get(`/agents/${id}`),
  getMyStats: () => client.get('/agents/stats/my')
};

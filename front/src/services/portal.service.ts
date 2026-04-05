import axios from 'axios';

const CUSTOMER_PORTAL_TOKEN_KEY = 'gt_customer_access_token';

export function getPortalToken() {
  return localStorage.getItem(CUSTOMER_PORTAL_TOKEN_KEY);
}

export function setPortalToken(token: string) {
  localStorage.setItem(CUSTOMER_PORTAL_TOKEN_KEY, token);
}

export function clearPortalToken() {
  localStorage.removeItem(CUSTOMER_PORTAL_TOKEN_KEY);
}

const portalApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

portalApi.interceptors.request.use((config) => {
  const token = getPortalToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type CreatePortalTicketInput = {
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

export async function createPortalTicket(input: CreatePortalTicketInput) {
  const { data } = await portalApi.post('/portal/tickets', input);
  return data;
}

export async function listPortalTickets() {
  const { data } = await portalApi.get('/portal/tickets');
  return data as {
    items: Array<{
      id: string;
      subject: string;
      status: string;
      priority: string;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

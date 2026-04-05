import { api } from './api';
import type { PaginatedTickets, Ticket, TicketStatus } from '../types/ticket';

export type ListTicketsParams = {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  search?: string;
};

export async function fetchTickets(params: ListTicketsParams = {}) {
  const { data } = await api.get<PaginatedTickets>('/tickets', { params });
  return data;
}

export async function fetchTicketById(ticketId: string) {
  const { data } = await api.get<Ticket>(`/tickets/${ticketId}`);
  return data;
}

'use client';

import { create } from 'zustand';
import { Ticket, Status, CreateTicketInput, UpdateTicketInput, Pagination } from '@/types/ticket';
import * as ticketsApi from '@/lib/api/ticketsApi';
import { ApiException } from '@/lib/api/fetchClient';

interface TicketStore {
  tickets: Ticket[];
  pagination: Pagination | null;
  activeTicket: Ticket | null;
  loading: boolean;
  error: string | null;

  fetchTickets: (params?: { search?: string; status?: Status; priority?: string; assignedTo?: string; page?: number; limit?: number }) => Promise<void>;
  fetchTicket: (id: string) => Promise<void>;
  createTicket: (data: CreateTicketInput) => Promise<Ticket>;
  updateTicket: (id: string, data: UpdateTicketInput) => Promise<Ticket>;
  changeStatus: (id: string, status: Status, userId: string) => Promise<Ticket>;
  clearError: () => void;
}

let searchAbortController: AbortController | null = null;

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  pagination: null,
  activeTicket: null,
  loading: false,
  error: null,

  fetchTickets: async (params) => {
    if (searchAbortController) {
      searchAbortController.abort();
    }
    const controller = new AbortController();
    searchAbortController = controller;

    set({ loading: true, error: null });
    try {
      const result = await ticketsApi.getTickets({
        ...params,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        set({ tickets: result.data, pagination: result.pagination, loading: false });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof ApiException ? err.message : 'Failed to load tickets';
      if (!controller.signal.aborted) {
        set({ error: msg, loading: false });
      }
    }
  },

  fetchTicket: async (id) => {
    set({ loading: true, error: null });
    try {
      const ticket = await ticketsApi.getTicket(id);
      set({ activeTicket: ticket, loading: false });
    } catch (err) {
      const msg = err instanceof ApiException ? err.message : 'Failed to load ticket';
      set({ error: msg, loading: false });
    }
  },

  createTicket: async (data) => {
    const ticket = await ticketsApi.createTicket(data);
    set((state) => ({ tickets: [ticket, ...state.tickets] }));
    return ticket;
  },

  updateTicket: async (id, data) => {
    const ticket = await ticketsApi.updateTicket(id, data);
    set({ activeTicket: ticket });
    return ticket;
  },

  changeStatus: async (id, status, userId) => {
    try {
      const ticket = await ticketsApi.changeStatus(id, status, userId);
      set({ activeTicket: ticket, error: null });
      return ticket;
    } catch (err) {
      const msg = err instanceof ApiException ? err.message : 'Status change failed';
      set({ error: msg });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

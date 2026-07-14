'use client';

import { create } from 'zustand';
import { Ticket, Status, CreateTicketInput, UpdateTicketInput } from '@/types/ticket';
import * as ticketsApi from '@/lib/api/ticketsApi';
import { ApiException } from '@/lib/api/fetchClient';

interface TicketStore {
  tickets: Ticket[];
  activeTicket: Ticket | null;
  loading: boolean;
  error: string | null;

  fetchTickets: (params?: { search?: string; status?: Status }) => Promise<void>;
  fetchTicket: (id: string) => Promise<void>;
  createTicket: (data: CreateTicketInput) => Promise<Ticket>;
  updateTicket: (id: string, data: UpdateTicketInput) => Promise<Ticket>;
  changeStatus: (id: string, status: Status, userId: string) => Promise<Ticket>;
  clearError: () => void;
}

// Holds the AbortController for the current in-flight fetchTickets request.
// When a new search fires, the previous one is cancelled.
let searchAbortController: AbortController | null = null;

export const useTicketStore = create<TicketStore>((set) => ({
  tickets: [],
  activeTicket: null,
  loading: false,
  error: null,

  fetchTickets: async (params) => {
    // Cancel any in-flight search request
    if (searchAbortController) {
      searchAbortController.abort();
    }
    const controller = new AbortController();
    searchAbortController = controller;

    set({ loading: true, error: null });
    try {
      const tickets = await ticketsApi.getTickets({
        ...params,
        signal: controller.signal,
      });
      // Only update state if this request wasn't aborted
      if (!controller.signal.aborted) {
        set({ tickets, loading: false });
      }
    } catch (err) {
      // Ignore abort errors — they're intentional
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
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

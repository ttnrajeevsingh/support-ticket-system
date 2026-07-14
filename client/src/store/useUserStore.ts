'use client';

import { create } from 'zustand';
import { User } from '@/types/ticket';
import * as usersApi from '@/lib/api/usersApi';

interface UserStore {
  users: User[];
  loading: boolean;
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const users = await usersApi.getUsers();
      set({ users, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

'use client';

import { create } from 'zustand';
import { Comment } from '@/types/ticket';
import * as commentsApi from '@/lib/api/commentsApi';
import { ApiException } from '@/lib/api/fetchClient';

interface CommentStore {
  comments: Comment[];
  loading: boolean;
  error: string | null;

  fetchComments: (ticketId: string) => Promise<void>;
  addComment: (ticketId: string, message: string, createdBy: string) => Promise<void>;
  clearError: () => void;
}

export const useCommentStore = create<CommentStore>((set) => ({
  comments: [],
  loading: false,
  error: null,

  fetchComments: async (ticketId) => {
    set({ loading: true, error: null });
    try {
      const comments = await commentsApi.getComments(ticketId);
      set({ comments, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addComment: async (ticketId, message, createdBy) => {
    try {
      const comment = await commentsApi.addComment(ticketId, message, createdBy);
      set((state) => ({ comments: [...state.comments, comment], error: null }));
    } catch (err) {
      const msg = err instanceof ApiException ? err.message : 'Failed to add comment';
      set({ error: msg });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

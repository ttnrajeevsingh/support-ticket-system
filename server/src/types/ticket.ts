// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'agent';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  assignee?: User | null;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdAt: string;
  author?: User;
}

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: Priority;
  assignedTo?: string;
  createdBy: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  priority?: Priority;
  assignedTo?: string | null;
}

export interface ChangeStatusInput {
  status: Status;
  userId: string;
}

export interface CreateCommentInput {
  message: string;
  createdBy: string;
}

export interface TicketFilters {
  search?: string;
  status?: Status;
  priority?: Priority;
  assignedTo?: string;
}

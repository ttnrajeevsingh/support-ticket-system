'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTicketStore } from '@/store/useTicketStore';
import { useUserStore } from '@/store/useUserStore';
import { Priority } from '@/types/ticket';
import { ApiException } from '@/lib/api/fetchClient';
import styles from './TicketForm.module.scss';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export default function TicketForm() {
  const router = useRouter();
  const { createTicket } = useTicketStore();
  const { users, fetchUsers } = useUserStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (users.length > 0 && !createdBy) {
      setCreatedBy(users[0].id);
    }
  }, [users, createdBy]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }
    if (title.trim().length > 200) {
      errs.title = 'Title must be at most 200 characters';
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }
    if (!createdBy) {
      errs.createdBy = 'Please select who is creating this ticket';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedTo: assignedTo || undefined,
        createdBy,
      });
      router.push('/');
    } catch (err) {
      if (err instanceof ApiException) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {apiError && <div className={styles.apiError}>{apiError}</div>}

      <div className={styles.field}>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief summary of the issue"
          className={errors.title ? styles.inputError : ''}
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description (at least 10 characters)"
          className={errors.description ? styles.inputError : ''}
        />
        {errors.description && <span className={styles.error}>{errors.description}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="priority">Priority *</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="assignedTo">Assign To</label>
          <select
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="createdBy">Created By *</label>
        <select
          id="createdBy"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          className={errors.createdBy ? styles.inputError : ''}
        >
          <option value="">Select user...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        {errors.createdBy && <span className={styles.error}>{errors.createdBy}</span>}
      </div>

      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
}

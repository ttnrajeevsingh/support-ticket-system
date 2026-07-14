'use client';

import { useEffect, useState } from 'react';
import { useTicketStore } from '@/store/useTicketStore';
import { useUserStore } from '@/store/useUserStore';
import { Priority } from '@/types/ticket';
import { ApiException } from '@/lib/api/fetchClient';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import StatusControl from './StatusControl';
import CommentSection from '@/components/comments/CommentSection';
import styles from './TicketDetailView.module.scss';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

interface Props {
  ticketId: string;
}

export default function TicketDetailView({ ticketId }: Props) {
  const { activeTicket, loading, error, fetchTicket, updateTicket, clearError } = useTicketStore();
  const { users, fetchUsers } = useUserStore();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<Priority>('medium');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetchTicket(ticketId);
    fetchUsers();
  }, [ticketId, fetchTicket, fetchUsers]);

  function startEdit() {
    if (!activeTicket) return;
    setEditTitle(activeTicket.title);
    setEditDescription(activeTicket.description);
    setEditPriority(activeTicket.priority);
    setEditAssignedTo(activeTicket.assignedTo || '');
    setSaveError('');
    setEditing(true);
  }

  async function handleSave() {
    setSaveError('');
    try {
      await updateTicket(ticketId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        assignedTo: editAssignedTo || null,
      });
      setEditing(false);
    } catch (err) {
      if (err instanceof ApiException) setSaveError(err.message);
      else setSaveError('Failed to save changes');
    }
  }

  if (loading && !activeTicket) {
    return <p className={styles.loading}>Loading ticket...</p>;
  }

  if (error && !activeTicket) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!activeTicket) {
    return <p className={styles.error}>Ticket not found</p>;
  }

  const t = activeTicket;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>{t.title}</h1>
        <div className={styles.meta}>
          <span>Created by {t.creator?.name ?? 'Unknown'}</span>
          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
          <StatusBadge status={t.status} />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Fields section */}
      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>Details</span>
          {!editing && (
            <button className={styles.editBtn} onClick={startEdit}>Edit</button>
          )}
        </div>

        {!editing ? (
          <>
            <div className={styles.fields}>
              <div>
                <div className={styles.fieldLabel}>Priority</div>
                <div className={styles.fieldValue}><PriorityBadge priority={t.priority} /></div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Assignee</div>
                <div className={styles.fieldValue}>{t.assignee?.name ?? 'Unassigned'}</div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Status</div>
                <div className={styles.fieldValue}><StatusBadge status={t.status} /></div>
              </div>
              <div>
                <div className={styles.fieldLabel}>Updated</div>
                <div className={styles.fieldValue}>{new Date(t.updatedAt).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className={styles.fieldLabel}>Description</div>
              <p className={styles.description}>{t.description}</p>
            </div>
          </>
        ) : (
          <div className={styles.editForm}>
            {saveError && <div className={styles.error}>{saveError}</div>}
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
              <select value={editAssignedTo} onChange={(e) => setEditAssignedTo(e.target.value)}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.editActions}>
              <button className={styles.saveBtn} onClick={handleSave}>Save</button>
              <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {/* Status Control */}
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Transition Status</span>
        <StatusControl ticketId={ticketId} currentStatus={t.status} />
      </div>

      {/* Comments */}
      <div className={styles.section}>
        <CommentSection ticketId={ticketId} />
      </div>
    </div>
  );
}

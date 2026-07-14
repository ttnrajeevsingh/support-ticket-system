'use client';

import { useState, FormEvent } from 'react';
import { useCommentStore } from '@/store/useCommentStore';
import { useUserStore } from '@/store/useUserStore';
import styles from './CommentForm.module.scss';

interface Props {
  ticketId: string;
}

export default function CommentForm({ ticketId }: Props) {
  const { addComment, error, clearError } = useCommentStore();
  const { users } = useUserStore();
  const [message, setMessage] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!message.trim()) {
      setValidationError('Comment cannot be empty');
      return;
    }

    const userId = createdBy || users[0]?.id;
    if (!userId) {
      setValidationError('No user available');
      return;
    }

    setSubmitting(true);
    try {
      await addComment(ticketId, message.trim(), userId);
      setMessage('');
    } catch {
      // Error is set in store
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {(validationError || error) && (
        <div className={styles.error}>{validationError || error}</div>
      )}

      <textarea
        className={styles.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
      />

      <div className={styles.actions}>
        <select
          className={styles.userSelect}
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
        >
          <option value="">Comment as {users[0]?.name ?? '...'}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}

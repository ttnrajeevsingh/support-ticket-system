'use client';

import { useState } from 'react';
import { Status } from '@/types/ticket';
import { VALID_TRANSITIONS, STATUS_LABELS } from '@/lib/statusTransitions';
import { useTicketStore } from '@/store/useTicketStore';
import { useUserStore } from '@/store/useUserStore';
import StatusBadge from './StatusBadge';
import styles from './StatusControl.module.scss';

interface Props {
  ticketId: string;
  currentStatus: Status;
}

const TRANSITION_BUTTON_LABELS: Record<Status, string> = {
  in_progress: 'Start Progress',
  resolved: 'Mark Resolved',
  closed: 'Close',
  cancelled: 'Cancel Ticket',
  open: 'Reopen',
};

export default function StatusControl({ ticketId, currentStatus }: Props) {
  const { changeStatus, error, clearError } = useTicketStore();
  const { users } = useUserStore();
  const [loadingStatus, setLoadingStatus] = useState<Status | null>(null);

  const validNext = VALID_TRANSITIONS[currentStatus] || [];

  async function handleTransition(targetStatus: Status) {
    clearError();
    // Use first user as the actor (no auth in Core)
    const userId = users[0]?.id;
    if (!userId) return;

    setLoadingStatus(targetStatus);
    try {
      await changeStatus(ticketId, targetStatus, userId);
    } catch {
      // Error is set in the store
    } finally {
      setLoadingStatus(null);
    }
  }

  if (validNext.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.current}>
          <span className={styles.label}>Status</span>
          <StatusBadge status={currentStatus} />
          <span className={styles.terminal}>Terminal state — no further transitions</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.current}>
        <span className={styles.label}>Status</span>
        <StatusBadge status={currentStatus} />
      </div>

      <div className={styles.actions}>
        {validNext.map((target) => (
          <button
            key={target}
            className={`${styles.btn} ${styles[target]}`}
            onClick={() => handleTransition(target)}
            disabled={loadingStatus !== null}
          >
            {loadingStatus === target ? 'Updating...' : TRANSITION_BUTTON_LABELS[target]}
          </button>
        ))}
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button className={styles.dismiss} onClick={clearError}>×</button>
        </div>
      )}
    </div>
  );
}

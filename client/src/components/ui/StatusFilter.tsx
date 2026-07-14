'use client';

import { Status } from '@/types/ticket';
import { STATUS_LABELS } from '@/lib/statusTransitions';
import styles from './StatusFilter.module.scss';

interface Props {
  value: Status | '';
  onChange: (status: Status | '') => void;
}

const allStatuses: Status[] = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];

export default function StatusFilter({ value, onChange }: Props) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value as Status | '')}
      aria-label="Filter by status"
    >
      <option value="">All Statuses</option>
      {allStatuses.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}

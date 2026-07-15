'use client';

import { Priority } from '@/types/ticket';
import { PRIORITY_LABELS } from '@/lib/statusTransitions';
import styles from './StatusFilter.module.scss'; // reuse same dropdown styling

interface Props {
  value: Priority | '';
  onChange: (priority: Priority | '') => void;
}

const allPriorities: Priority[] = ['low', 'medium', 'high', 'critical'];

export default function PriorityFilter({ value, onChange }: Props) {
  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value as Priority | '')}
      aria-label="Filter by priority"
    >
      <option value="">All Priorities</option>
      {allPriorities.map((p) => (
        <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
      ))}
    </select>
  );
}

'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import styles from './StatusFilter.module.scss'; // reuse same dropdown styling

interface Props {
  value: string;
  onChange: (userId: string) => void;
}

export default function AssigneeFilter({ value, onChange }: Props) {
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    if (users.length === 0) fetchUsers();
  }, [users.length, fetchUsers]);

  return (
    <select
      className={styles.select}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Filter by assignee"
    >
      <option value="">All Assignees</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>{u.name}</option>
      ))}
    </select>
  );
}

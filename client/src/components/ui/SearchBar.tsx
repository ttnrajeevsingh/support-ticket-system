'use client';

import { useState, useEffect } from 'react';
import styles from './SearchBar.module.scss';

interface Props {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search tickets...' }: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timeout);
  }, [value, onSearch]);

  return (
    <input
      type="text"
      className={styles.input}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-label="Search tickets"
    />
  );
}

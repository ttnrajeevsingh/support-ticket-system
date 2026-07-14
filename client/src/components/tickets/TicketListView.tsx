'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import Link from 'next/link';
import { useTicketStore } from '@/store/useTicketStore';
import { Status } from '@/types/ticket';
import SearchBar from '@/components/ui/SearchBar';
import StatusFilter from '@/components/ui/StatusFilter';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TicketTableSkeleton from './TicketTableSkeleton';
import styles from './TicketListView.module.scss';

export default function TicketListView() {
  const { tickets, loading, error, fetchTickets } = useTicketStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const hasLoadedOnce = useRef(false);

  const load = useCallback(() => {
    fetchTickets({
      search: search || undefined,
      status: statusFilter || undefined,
    });
  }, [search, statusFilter, fetchTickets]);

  useEffect(() => {
    load();
    if (!hasLoadedOnce.current) hasLoadedOnce.current = true;
  }, [load]);

  const handleSearch = useCallback((val: string) => setSearch(val), []);
  const handleFilter = useCallback((val: Status | '') => setStatusFilter(val), []);

  const showSkeleton = loading;
  const showEmpty = !loading && hasLoadedOnce.current && tickets.length === 0;
  const showTable = !loading && tickets.length > 0;

  return (
    <div className={styles.card}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <SearchBar onSearch={handleSearch} />
          <StatusFilter value={statusFilter} onChange={handleFilter} />
        </div>
        <Link href="/tickets/new" className={styles.createBtn}>
          + New Ticket
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Skeleton */}
      {showSkeleton && <TicketTableSkeleton rows={5} />}

      {/* Empty state */}
      {showEmpty && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🎫</div>
          <p className={styles.emptyTitle}>No tickets found</p>
          <p className={styles.emptyDesc}>
            {search || statusFilter
              ? 'Try adjusting your search or filter.'
              : 'Create your first ticket to get started.'}
          </p>
        </div>
      )}

      {/* Table */}
      {showTable && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className={styles.row}>
                  <td>
                    <Link href={`/tickets/${ticket.id}`} className={styles.title}>
                      {ticket.title}
                    </Link>
                  </td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td><PriorityBadge priority={ticket.priority} /></td>
                  <td className={styles.assignee}>
                    {ticket.assignee ? (
                      <span className={styles.avatar}>
                        {ticket.assignee.name.charAt(0)}
                      </span>
                    ) : null}
                    {ticket.assignee?.name ?? '—'}
                  </td>
                  <td className={styles.date}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      {showTable && (
        <div className={styles.footer}>
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

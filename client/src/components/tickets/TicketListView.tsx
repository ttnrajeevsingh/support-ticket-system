'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTicketStore } from '@/store/useTicketStore';
import { Status, Priority } from '@/types/ticket';
import SearchBar from '@/components/ui/SearchBar';
import StatusFilter from '@/components/ui/StatusFilter';
import PriorityFilter from '@/components/ui/PriorityFilter';
import AssigneeFilter from '@/components/ui/AssigneeFilter';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import TicketTableSkeleton from './TicketTableSkeleton';
import styles from './TicketListView.module.scss';

const PAGE_SIZE = 10;

export default function TicketListView() {
  const router = useRouter();
  const { tickets, pagination, loading, error, fetchTickets } = useTicketStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [page, setPage] = useState(1);
  const hasLoadedOnce = useRef(false);

  const load = useCallback(() => {
    fetchTickets({
      search: search || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      assignedTo: assigneeFilter || undefined,
      page,
      limit: PAGE_SIZE,
    });
  }, [search, statusFilter, priorityFilter, assigneeFilter, page, fetchTickets]);

  useEffect(() => {
    load();
    if (!hasLoadedOnce.current) hasLoadedOnce.current = true;
  }, [load]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilter = useCallback((val: Status | '') => {
    setStatusFilter(val);
    setPage(1);
  }, []);

  const handlePriorityFilter = useCallback((val: Priority | '') => {
    setPriorityFilter(val);
    setPage(1);
  }, []);

  const handleAssigneeFilter = useCallback((val: string) => {
    setAssigneeFilter(val);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowClick = useCallback((ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  }, [router]);

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
          <PriorityFilter value={priorityFilter} onChange={handlePriorityFilter} />
          <AssigneeFilter value={assigneeFilter} onChange={handleAssigneeFilter} />
        </div>
        <Link href="/tickets/new" className={styles.createBtn}>
          + New Ticket
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Skeleton */}
      {showSkeleton && <TicketTableSkeleton rows={PAGE_SIZE} />}

      {/* Empty state */}
      {showEmpty && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No tickets found</p>
          <p className={styles.emptyDesc}>
            {search || statusFilter || priorityFilter || assigneeFilter
              ? 'Try adjusting your search or filters.'
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
                <tr
                  key={ticket.id}
                  className={styles.row}
                  onClick={() => handleRowClick(ticket.id)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleRowClick(ticket.id);
                  }}
                  aria-label={`View ticket: ${ticket.title}`}
                >
                  <td>
                    <span className={styles.title}>{ticket.title}</span>
                    <span className={styles.titleId}>#{ticket.id.slice(0, 8)}</span>
                  </td>
                  <td><StatusBadge status={ticket.status} /></td>
                  <td><PriorityBadge priority={ticket.priority} /></td>
                  <td className={styles.assignee}>
                    {ticket.assignee ? (
                      <>
                        <span className={styles.avatar}>
                          {ticket.assignee.name.charAt(0)}
                        </span>
                        {ticket.assignee.name}
                      </>
                    ) : (
                      <span className={styles.unassigned}>Unassigned</span>
                    )}
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

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

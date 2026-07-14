import Skeleton from '@/components/ui/Skeleton';
import styles from './TicketTableSkeleton.module.scss';

interface Props {
  rows?: number;
}

export default function TicketTableSkeleton({ rows = 5 }: Props) {
  return (
    <div className={styles.container}>
      {/* Table header skeleton */}
      <div className={styles.headerRow}>
        <Skeleton width="25%" height="0.75rem" />
        <Skeleton width="10%" height="0.75rem" />
        <Skeleton width="10%" height="0.75rem" />
        <Skeleton width="12%" height="0.75rem" />
        <Skeleton width="10%" height="0.75rem" />
      </div>

      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.row}>
          <Skeleton width={`${60 + Math.random() * 30}%`} height="0.875rem" />
          <Skeleton width="70px" height="1.25rem" borderRadius="9999px" />
          <Skeleton width="55px" height="1.25rem" borderRadius="4px" />
          <Skeleton width="90px" height="0.875rem" />
          <Skeleton width="75px" height="0.875rem" />
        </div>
      ))}
    </div>
  );
}

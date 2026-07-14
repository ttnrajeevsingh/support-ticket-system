import { Status } from '@/types/ticket';
import { STATUS_LABELS } from '@/lib/statusTransitions';
import styles from './StatusBadge.module.scss';

interface Props {
  status: Status;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

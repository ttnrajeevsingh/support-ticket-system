import { Priority } from '@/types/ticket';
import { PRIORITY_LABELS } from '@/lib/statusTransitions';
import styles from './PriorityBadge.module.scss';

interface Props {
  priority: Priority;
}

export default function PriorityBadge({ priority }: Props) {
  return (
    <span className={`${styles.badge} ${styles[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

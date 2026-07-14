import { Comment } from '@/types/ticket';
import styles from './CommentItem.module.scss';

interface Props {
  comment: Comment;
}

export default function CommentItem({ comment }: Props) {
  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <span className={styles.author}>{comment.author?.name ?? 'Unknown'}</span>
        <span className={styles.date}>
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
      <p className={styles.message}>{comment.message}</p>
    </div>
  );
}

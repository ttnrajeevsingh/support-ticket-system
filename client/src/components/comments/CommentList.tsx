import { Comment } from '@/types/ticket';
import CommentItem from './CommentItem';
import styles from './CommentList.module.scss';

interface Props {
  comments: Comment[];
}

export default function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return <p className={styles.empty}>No comments yet.</p>;
  }

  return (
    <div className={styles.list}>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

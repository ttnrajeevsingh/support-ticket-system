'use client';

import { useEffect } from 'react';
import { useCommentStore } from '@/store/useCommentStore';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import styles from './CommentSection.module.scss';

interface Props {
  ticketId: string;
}

export default function CommentSection({ ticketId }: Props) {
  const { comments, loading, fetchComments } = useCommentStore();

  useEffect(() => {
    fetchComments(ticketId);
  }, [ticketId, fetchComments]);

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {loading && <p className={styles.loading}>Loading comments...</p>}

      <CommentList comments={comments} />
      <CommentForm ticketId={ticketId} />
    </div>
  );
}

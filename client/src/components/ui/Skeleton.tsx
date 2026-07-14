import styles from './Skeleton.module.scss';

interface Props {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export default function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px' }: Props) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

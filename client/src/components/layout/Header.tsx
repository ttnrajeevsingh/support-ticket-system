import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Support Tickets
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>All Tickets</Link>
          <Link href="/tickets/new" className={styles.link}>New Ticket</Link>
        </nav>
      </div>
    </header>
  );
}

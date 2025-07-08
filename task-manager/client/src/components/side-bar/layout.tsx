'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>Task Manager</h2>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={pathname === '/dashboard' ? styles.active : ''}>Dashboard</Link>
          <Link href="/task" className={pathname === '/task' ? styles.active : ''}>Task</Link>
          <Link href="/comments" className={pathname === '/comments' ? styles.active : ''}>Comments</Link>
        </nav>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;

'use client';
import Link from 'next/link';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, breadcrumbs = [] }) {
  return (
    <section className={styles.pageHeader}>
      <div className={styles.overlay}></div>
      <div className={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.particle} style={{ animationDelay: `${i * 0.5}s` }}></div>
        ))}
      </div>
      <div className="container">
        <div className={styles.inner}>
          <h1 className={styles.title}>{title}</h1>
          <ul className={styles.breadcrumb}>
            <li><Link href="/">Home</Link></li>
            {breadcrumbs.map((item, i) => (
              <li key={i}>
                <span className={styles.separator}>›</span>
                {item.href ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

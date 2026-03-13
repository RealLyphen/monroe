'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './not-found.module.css';

export default function NotFound() {
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) setTimeout(() => preloader.classList.add('loaded'), 300);
  }, []);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.bg}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.particle} style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
            }}></div>
          ))}
        </div>
        <div className="container">
          <div className={styles.content}>
            <h1 className={styles.code}>404</h1>
            <h2 className={styles.title}>Page Not Found</h2>
            <p className={styles.text}>
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

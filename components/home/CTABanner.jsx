'use client';
import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import styles from './CTABanner.module.css';

const FEATURES = [
  { icon: '🔒', label: 'Full Privacy' },
  { icon: '🌍', label: 'Global Shipping' },
  { icon: '📦', label: 'Verified Address' },
  { icon: '⚡', label: 'Instant Setup' },
];

export default function CTABanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.section} ref={ref}>
      {/* Background glow orbs */}
      <div className={styles.orbLeft} />
      <div className={styles.orbRight} />
      <div className={styles.gridOverlay} />

      {/* Content */}
      <div className={styles.inner}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            Trusted by thousands worldwide
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className={styles.heading}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.15 }}
        >
          Ship smarter,{' '}
          <span className={styles.headingAccent}>anywhere.</span>
        </motion.h2>

        {/* Sub */}
        <motion.p
          className={styles.sub}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.28 }}
        >
          Get a verified residential address, complete privacy, and seamless
          worldwide delivery — all under one roof.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          className={styles.pills}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {FEATURES.map((f) => (
            <span key={f.label} className={styles.pill}>
              <span className={styles.pillIcon}>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.52, type: 'spring', stiffness: 170 }}
        >
          <Link href="/login" className={styles.ctaPrimary}>
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/services" className={styles.ctaSecondary}>
            Learn more
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

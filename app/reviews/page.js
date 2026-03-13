'use client';
import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import Link from 'next/link';
import styles from './page.module.css';

// Live reviews will be fetched from API
function StarRating({ count }) {
  return (
    <div className={styles.stars}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </div>
  );
}

function ReviewCard({ review, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className={`${styles.card} ${styles[`card_${review.size}`]}`}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <div className={styles.quoteIcon}>"</div>
      <p className={styles.cardText}>{review.text}</p>
      <div className={styles.cardFooter}>
        <div
          className={styles.cardAvatar}
          style={{ background: review.color }}
        >
          {review.initials}
        </div>
        <div className={styles.cardMeta}>
          <span className={styles.cardName}>{review.name}</span>
          <span className={styles.cardRole}>{review.role}</span>
        </div>
        <StarRating count={review.stars} />
      </div>
    </motion.div>
  );
}

export default function ReviewsPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  
  const [reviewsData, setReviewsData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        // Map backend format to component format
        const formatted = (data.reviews || []).map((r, i) => {
           const sizes = ['normal', 'tall', 'short'];
           const colors = ['#2a1f05', '#0f1a2a', '#0a1f0f', '#1f0a15', '#0d1a0d', '#1a1005'];
           return {
             name: r.username,
             role: 'Verified Customer',
             initials: r.username.substring(0, 2).toUpperCase(),
             color: colors[i % colors.length],
             text: r.content,
             stars: r.rating || 5,
             size: sizes[i % sizes.length]
           };
        });
        setReviewsData(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className={styles.page}>
      {/* ── Hero ── */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className={styles.pill}>
              <span className={styles.pillDot} />
              Testimonials
            </span>
          </motion.div>

          <motion.h1
            className={styles.heroHeading}
            initial={{ opacity: 0, y: 28 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1 }}
          >
            What our clients<br />
            <span className={styles.heroAccent}>are saying</span>
          </motion.h1>

          <motion.p
            className={styles.heroSub}
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Real customers. Real shipments. Here's what thousands of Monroe users
            have to say about their experience.
          </motion.p>

          {/* stat row */}
          <motion.div
            className={styles.stats}
            initial={{ opacity: 0, y: 16 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {[
              { val: '4,800+', label: 'Happy customers' },
              { val: '4.9 / 5', label: 'Average rating' },
              { val: '98%', label: 'Would recommend' },
            ].map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statVal}>{s.val}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Badge line ── */}
      <div className={styles.badgeLine}>
        <span className={styles.badgeLinePill}>Verified Reviews</span>
      </div>

      {/* ── Masonry grid ── */}
      <section className={styles.gridSection}>
        {loading ? (
          <div style={{textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.6)'}}>Loading Reviews...</div>
        ) : reviewsData.length === 0 ? (
          <div style={{textAlign: 'center', padding: '100px', color: 'rgba(255,255,255,0.6)'}}>No vouches yet. Be the first to leave one in your dashboard!</div>
        ) : (
          <div className={styles.masonryGrid}>
            {reviewsData.map((r, i) => (
              <ReviewCard key={i} review={r} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.bottomCta}>
        <div className={styles.bottomCtaInner}>
          <h2 className={styles.bottomCtaHeading}>Want to see more vouches?</h2>
          <p className={styles.bottomCtaSub}>Hover our official Telegram channel today — real reviews, real clients.</p>
          <a href="https://t.me/monroe" target="_blank" rel="noopener noreferrer" className={styles.bottomCtaBtn}>
            Join Telegram
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}

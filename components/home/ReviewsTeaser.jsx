'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ReviewsTeaser.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ReviewsTeaser() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const trustRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      });

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 40, filter: 'blur(12px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
      )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 30, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20, filter: 'blur(10px)', scale: 0.95 },
          { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
          '-=0.35'
        )
        .fromTo(
          trustRef.current,
          { opacity: 0, filter: 'blur(8px)' },
          { opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      {/* Boxed container */}
      <div className={styles.box}>
        {/* Grid overlay */}
        <div className={styles.gridOverlay} />

        {/* Neon glowing yellow lines */}
        <div className={`${styles.neonLine} ${styles.nl1}`} />
        <div className={`${styles.neonLine} ${styles.nl2}`} />
        <div className={`${styles.neonLine} ${styles.nl3}`} />
        <div className={`${styles.neonLine} ${styles.nl4}`} />
        <div className={`${styles.neonLine} ${styles.nl5}`} />
        <div className={`${styles.neonLine} ${styles.nl6}`} />
        <div className={`${styles.neonLine} ${styles.nl7}`} />
        <div className={`${styles.neonLine} ${styles.nl8}`} />

        {/* Dimmer background lines */}
        <div className={`${styles.bgLine} ${styles.bl1}`} />
        <div className={`${styles.bgLine} ${styles.bl2}`} />
        <div className={`${styles.bgLine} ${styles.bl3}`} />
        <div className={`${styles.bgLine} ${styles.bl4}`} />
        <div className={`${styles.bgLine} ${styles.bl5}`} />
        <div className={`${styles.bgLine} ${styles.bl6}`} />

        {/* Center fade — softens the lines in the text area */}
        <div className={styles.centerFade} />

        <div className={styles.inner}>
          {/* Headline */}
          <h2 className={styles.heading} ref={headingRef}>
            Join over{' '}
            <span className={styles.highlight}>4,800+ customers</span>
            <br />who trust Monroe.
          </h2>

          {/* Sub */}
          <p className={styles.sub} ref={subRef}>
            Real people. Real shipments. Read what our users say about their experience with Monroe.
          </p>

          {/* CTA */}
          <div ref={ctaRef}>
            <Link href="/reviews" className={styles.cta}>
              Read Reviews
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Trust note */}
          <p className={styles.trustNote} ref={trustRef}>
            <span className={styles.checkIcon}>✓</span>
            Verified reviews from real Monroe customers
          </p>
        </div>
      </div>
    </section>
  );
}

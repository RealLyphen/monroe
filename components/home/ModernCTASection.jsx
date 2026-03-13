import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaShieldAlt, FaTelegramPlane, FaBoxes, FaCheckCircle, FaStar } from 'react-icons/fa';
import styles from './ModernCTASection.module.css';

// Ensure GSAP plugins are registered (safe for Next.js SSR)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ModernCTASection() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the main card scaling in
      gsap.fromTo(
        cardRef.current,
        { scale: 0.95, opacity: 0, y: 30 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );

      // Animate interior elements staggering in
      gsap.fromTo(
        '.gsap-reveal',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.sectionWrap}>
      <div className="container">
        <div ref={cardRef} className={styles.ctaCard}>
          {/* Glowing background elements matching the Monroe yellow theme */}
          <div className={styles.glowTopLeft}></div>
          <div className={styles.glowBottomRight}></div>

          <div className={styles.cardContent}>
            {/* Top Badge */}
            <div className={`${styles.badge} gsap-reveal`}>
              <FaStar className={styles.badgeIcon} />
              <span>Join 2,000+ Happy Customers</span>
            </div>

            {/* Main Title mimicking the "Ready to get your money back?" styling */}
            <h2 className={`${styles.mainTitle} gsap-reveal`}>
              Ready to start your <br />
              <span className={styles.gradientText}>reshipping journey?</span>
            </h2>

            {/* Subtext */}
            <p className={`${styles.subtext} gsap-reveal`}>
              Join thousands of satisfied clients. Connect with us on Telegram
              and simplify your logistics in minutes.
            </p>

            {/* Stats Row */}
            <div className={`${styles.statsRow} gsap-reveal`}>
              <div className={styles.statBox}>
                <h3 className={styles.statValue}>2K+</h3>
                <p className={styles.statLabel}>Happy Customers</p>
              </div>
              <div className={styles.statBox}>
                <h3 className={styles.statValue}>98%</h3>
                <p className={styles.statLabel}>Success Rate</p>
              </div>
              <div className={styles.statBox}>
                <h3 className={styles.statValue}>24/7</h3>
                <p className={styles.statLabel}>Support</p>
              </div>
            </div>

            {/* Features Pills Row */}
            <div className={`${styles.featuresPills} gsap-reveal`}>
              <div className={styles.pill}>
                <FaShieldAlt className={styles.pillIcon} /> 100% Secure & Regulated
              </div>
              <div className={styles.pill}>
                <FaBoxes className={styles.pillIcon} /> Expert Handling
              </div>
              <div className={styles.pill}>
                <FaCheckCircle className={styles.pillIcon} /> Large Network
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={`${styles.buttonGroup} gsap-reveal`}>
              <Link href="#" className={styles.primaryBtn}>
                Get Started Now <span className={styles.arrow}>→</span>
              </Link>
              <Link href="#" className={styles.secondaryBtn}>
                Learn How It Works
              </Link>
            </div>

            {/* Bottom Guarantee Text */}
            <p className={`${styles.bottomGuarantee} gsap-reveal`}>
              No upfront commitment required • Trusted & Reliable Service
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

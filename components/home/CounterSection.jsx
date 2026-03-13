'use client';
import { useEffect, useRef, useState } from 'react';
import { FiUsers, FiAward, FiStar, FiPlay } from 'react-icons/fi';
import styles from './CounterSection.module.css';

function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = 0;
          const startTime = performance.now();
          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * (end - start) + start));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { icon: <FiUsers />, end: 100, suffix: '+', label: 'Happy Customers' },
  { icon: <FiAward />, end: 2, suffix: 'K+', label: 'Team Members' },
  { icon: <FiStar />, end: 3, suffix: 'K+', label: 'Client Reviews' },
];

export default function CounterSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <div className={styles.videoBox}>
              <div className={styles.videoPlaceholder}>
                <button className={styles.playBtn} aria-label="Play video">
                  <FiPlay />
                  <span className={styles.ripple}></span>
                </button>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <span className="section-tagline">Our Features</span>
            <h2 className="section-title">Simplifying your logistics challenges</h2>
            <p className={styles.text}>
              Our logistics services combine cutting-edge technology with industry expertise to deliver solutions that drive efficiency and reliability.
            </p>
            <div className={styles.stats}>
              {stats.map((stat, i) => (
                <div key={i} className={styles.stat}>
                  <div className={styles.statIcon}>{stat.icon}</div>
                  <div className={styles.statNumber}>
                    <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                  </div>
                  <p className={styles.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';
import { FiPackage, FiClock, FiShield, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import styles from './AboutSection.module.css';

const features = [
  { icon: <FiPackage />, title: 'Delivering success through logistics' },
  { icon: <FiClock />, title: 'Logistics expertise for your competitive edge' },
  { icon: <FiShield />, title: 'Streamlining supply chain processes' },
];

export default function AboutSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <span className="section-tagline">About Us</span>
            <h2 className="section-title">Seamless logistics for your business needs</h2>
            <p className={styles.text}>
              With cutting-edge technology and a dedicated team, we provide comprehensive logistics solutions that help businesses thrive in a competitive market.
            </p>
            <div className={styles.features}>
              {features.map((f, i) => (
                <div key={i} className={styles.feature}>
                  <div className={styles.featureIcon}>{f.icon}</div>
                  <h4>{f.title}</h4>
                </div>
              ))}
            </div>
            <Link href="/about" className="btn-primary">
              Read More <FiArrowRight />
            </Link>
          </div>
          <div className={styles.right}>
            <div className={styles.imageGrid}>
              <div className={styles.img1}>
                <div className={styles.imgPlaceholder}></div>
              </div>
              <div className={styles.img2}>
                <div className={styles.imgPlaceholder2}></div>
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustNumber}>6K+</span>
                <span className={styles.trustLabel}>Trusted Customers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

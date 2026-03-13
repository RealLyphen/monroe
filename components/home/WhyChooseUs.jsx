'use client';
import { useEffect, useRef, useState } from 'react';
import { FiTruck, FiClock, FiBox, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <span className="section-tagline">Why Choose Us</span>
            <h2 className="section-title">Delivering excellence every time with Express Logistics</h2>
            <p className={styles.text}>
              With over a decade of experience, we provide end-to-end logistics solutions that streamline operations, reduce costs, and ensure timely deliveries across the globe.
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}><FiTruck /></div>
                <div>
                  <h4>Global Reach</h4>
                  <p>Delivering to 150+ countries worldwide</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}><FiClock /></div>
                <div>
                  <h4>On-Time Delivery</h4>
                  <p>99.2% on-time delivery track record</p>
                </div>
              </div>
            </div>
            <Link href="/about" className="btn-primary">
              Read More <FiArrowRight />
            </Link>
          </div>
          <div className={styles.right}>
            <div className={styles.imageContainer}>
              <div className={styles.imagePlaceholder}>
                <FiBox className={styles.placeholderIcon} />
              </div>
              <div className={styles.badge}>
                <FiTruck className={styles.badgeIcon} />
                <div>
                  <strong>2 Days</strong>
                  <span>Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

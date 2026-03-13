'use client';
import { useEffect } from 'react';

import PageHeader from '@/components/PageHeader';
import AboutSection from '@/components/home/AboutSection';
import CounterSection from '@/components/home/CounterSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import CTASection from '@/components/home/CTASection';
import { FiMapPin, FiClock, FiShield, FiTruck } from 'react-icons/fi';
import styles from './about.module.css';

const whyBest = [
  { icon: <FiMapPin />, title: 'Real Time Tracking', text: 'Track every shipment in real-time with our advanced GPS and IoT enabled tracking system.' },
  { icon: <FiClock />, title: 'On Time Delivery', text: 'Our 99.2% on-time delivery rate speaks for itself — reliability you can count on.' },
  { icon: <FiShield />, title: '24/7 Online Support', text: 'Round-the-clock customer support through phone, email, and live chat.' },
];

export default function AboutPage() {
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) setTimeout(() => preloader.classList.add('loaded'), 300);
  }, []);

  return (
    <>

      <main>
        <PageHeader title="About Us" breadcrumbs={[{ label: 'About Us' }]} />
        <AboutSection />
        <CounterSection />
        <TestimonialsSection />

        {/* Why Are We Best */}
        <section className={styles.whyBest}>
          <div className="container">
            <div className={styles.whyGrid}>
              <div className={styles.whyImage}>
                <div className={styles.whyImgPlaceholder}>
                  <FiTruck className={styles.whyImgIcon} />
                </div>
              </div>
              <div className={styles.whyContent}>
                <span className="section-tagline">Why We Are Best</span>
                <h2 className="section-title">Efficiency at its best with our logistics services</h2>
                <div className={styles.whyList}>
                  {whyBest.map((item, i) => (
                    <div key={i} className={styles.whyItem}>
                      <div className={styles.whyItemIcon}>{item.icon}</div>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.sinceBadge}>
                  <strong>Since 1920</strong>
                  <p>Over a century of logistics excellence, serving businesses worldwide with unwavering commitment.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <CTASection />
      </main>

    </>
  );
}

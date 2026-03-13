'use client';
import { useEffect } from 'react';
import Link from 'next/link';

import PageHeader from '@/components/PageHeader';
import CTASection from '@/components/home/CTASection';
import { FiPackage, FiHeadphones, FiBox, FiTruck, FiSettings, FiLayers, FiShield, FiClock, FiGlobe, FiArrowRight } from 'react-icons/fi';
import styles from './services.module.css';

const services = [
  { icon: <FiPackage />, title: 'Fast & Reliable Logistics Solutions' },
  { icon: <FiHeadphones />, title: 'Premium Customer Support Services' },
  { icon: <FiBox />, title: 'Scalable Supply Chain Infrastructure' },
  { icon: <FiTruck />, title: 'Logistics Expertise for Competitive Advantage' },
  { icon: <FiSettings />, title: 'Delivering Success Through Logistics' },
  { icon: <FiLayers />, title: 'Simplifying Your Logistics Challenges' },
  { icon: <FiShield />, title: 'Efficiency at Its Best with Logistics' },
  { icon: <FiClock />, title: 'Seamless Logistics for Your Business' },
  { icon: <FiGlobe />, title: 'Your Supply Chain Partner for Success' },
];

export default function ServicesPage() {
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) setTimeout(() => preloader.classList.add('loaded'), 300);
  }, []);

  return (
    <>

      <main>
        <PageHeader title="Our Services" breadcrumbs={[{ label: 'Services' }]} />
        <section className={styles.section}>
          <div className="container">
            <div className={styles.grid}>
              {services.map((service, i) => (
                <div key={i} className={styles.card}>
                  <div className={styles.cardInner}>
                    <div className={styles.iconWrap}>{service.icon}</div>
                    <h3 className={styles.cardTitle}>{service.title}</h3>
                    <p className={styles.cardText}>
                      Comprehensive logistics solutions designed to optimize your supply chain and accelerate business growth with cutting-edge technology.
                    </p>
                    <Link href="/services" className={styles.cardBtn}>
                      Read More <FiArrowRight />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <CTASection />
      </main>

    </>
  );
}

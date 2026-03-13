'use client';
import { FiPhone, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import styles from './CTASection.module.css';

export default function CTASection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.content}>
            <div className={styles.iconWrap}>
              <FiPhone className={styles.icon} />
              <div className={styles.pulse}></div>
            </div>
            <div className={styles.text}>
              <h3 className={styles.title}>Need any help?<br/>Contact us!</h3>
              <a href="tel:3075550133" className={styles.phone}>
                <FiPhone /> (307) 555-0133
              </a>
            </div>
            <Link href="/contact" className={styles.ctaBtn}>
              Get in Touch <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

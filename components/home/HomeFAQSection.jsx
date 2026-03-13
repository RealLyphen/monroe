'use client';
import { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';
import styles from './HomeFAQSection.module.css';

// Best 4 FAQs chosen for aesthetics and impact
const faqs = [
  {
    q: 'Are these real residential addresses?',
    a: 'Yes! All our addresses are verified real residential locations, not P.O. boxes. Every address goes through a strict verification process before being made available to customers.',
  },
  {
    q: 'How is my privacy protected?',
    a: 'We use OPSEC protocols, encrypted communications, and delete all order forms after setup. Your personal information is never shared with third parties without your explicit consent.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept BTC, ETH, USDT, LTC, and other major cryptocurrencies, ensuring fast, private, and borderless transactions with no chargebacks.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most accounts are ready within 24–48 hours. Once your account is verified, you\'ll receive your dedicated address and full dashboard access immediately.',
  },
];

export default function HomeFAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq-section" className={styles.section}>
      <div className={styles.bgGlow} />

      <div className="container">
        <div className={styles.grid}>

          {/* ── Left column ── */}
          <div className={styles.left}>
            {/* Title — aligns with first FAQ card */}
            <div className={styles.titleBlock}>
              <span className={styles.tagline}>FAQ</span>
              <h2 className={styles.title}>
                Frequently asked<br />
                <span className={styles.titleMuted}>questions</span>
              </h2>
            </div>

            {/* Contact card — pinned to bottom */}
            <div className={styles.contactCard}>
              <h3 className={styles.contactTitle}>Still have a question?</h3>
              <p className={styles.contactText}>
                Can't find the answer to your question? Send us an email and we'll get back to you as soon as possible!
              </p>
              <a href="mailto:support@monroe.com" className={styles.contactBtn}>
                Send email
              </a>
            </div>
          </div>

          {/* ── Right column — accordion ── */}
          <div className={styles.right}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`${styles.item} ${openIndex === i ? styles.itemOpen : ''}`}
                onClick={() => toggle(i)}
              >
                <div className={styles.itemHeader}>
                  <span className={styles.itemQ}>{faq.q}</span>
                  <span className={styles.itemIcon}>
                    {openIndex === i
                      ? <FiChevronUp size={16} />
                      : <FiChevronDown size={16} />}
                  </span>
                </div>
                {/* Answer — fully hidden until open */}
                <div className={`${styles.itemBody} ${openIndex === i ? styles.itemBodyOpen : ''}`}>
                  <p className={styles.itemA}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

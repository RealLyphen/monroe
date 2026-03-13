'use client';
import { useState } from 'react';
import { FiChevronDown, FiSend } from 'react-icons/fi';
import styles from './FAQSection.module.css';

const faqs = [
  { q: 'How can I track my shipment?', a: 'You can track your shipment in real-time through our online portal. Simply enter your tracking number and get instant updates on your package location, estimated delivery time, and status changes.' },
  { q: 'What is the average delivery time?', a: 'Our standard delivery takes 2-5 business days domestically and 5-10 days internationally. Express shipping options are available for urgent deliveries within 1-2 business days.' },
  { q: 'Do you offer insurance for shipments?', a: 'Yes, all shipments come with basic insurance coverage. Additional premium insurance options are available for high-value items, providing full coverage against damage, loss, or theft.' },
  { q: 'What areas do you serve?', a: 'We operate globally across 150+ countries with strategically located warehouses and distribution centers. Our network covers major cities and remote areas with equal efficiency.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <span className="section-tagline">FAQ</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className={styles.accordion}>
              {faqs.map((faq, i) => (
                <div key={i} className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}>
                  <button className={styles.itemHeader} onClick={() => setOpen(open === i ? -1 : i)}>
                    <span>{faq.q}</span>
                    <FiChevronDown className={styles.chevron} />
                  </button>
                  <div className={styles.itemBody}>
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Get a Free Quote</h3>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formRow}>
                  <input type="text" placeholder="Your Name" className={styles.input} />
                  <input type="email" placeholder="Your Email" className={styles.input} />
                </div>
                <div className={styles.formRow}>
                  <input type="tel" placeholder="Phone Number" className={styles.input} />
                  <select className={styles.input}>
                    <option>Choose Service</option>
                    <option>Express Freight</option>
                    <option>Quick Move</option>
                    <option>Speedy Dispatch</option>
                    <option>Supply Chain</option>
                  </select>
                </div>
                <textarea placeholder="Your message..." className={styles.textarea} rows={4}></textarea>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Now <FiSend />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';
import { useEffect, useRef } from 'react';
import { FiPackage, FiInbox, FiCheckCircle } from 'react-icons/fi';
import styles from './ServicesSection.module.css';

const services = [
  {
    icon: <FiPackage size={32} />,
    title: 'Submit Your Package',
    description: 'Enter your package details and tracking number in your dashboard so we can identify and prepare for your delivery.',
    delay: 0,
  },
  {
    icon: <FiInbox size={32} />,
    title: 'We Receive Your Package',
    description: 'Once your package arrives at our warehouse, our team securely processes and prepares it for forwarding.',
    delay: 0.15,
  },
  {
    icon: <FiCheckCircle size={32} />,
    title: 'Ship To Your Address',
    description: 'Request shipment anytime and we will quickly dispatch your package to your address with reliable tracking.',
    delay: 0.3,
  },
];

export default function ServicesSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.2 }
    );
    const elements = sectionRef.current?.querySelectorAll(`.${styles.stepItem}`);
    elements?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process-section" className={styles.section} ref={sectionRef}>
      <div className="container">
        <div className={styles.header}>
          <span className="section-tagline">Step by Step</span>
          <h2 className="section-title">How does this work?</h2>
        </div>

        <div className={styles.processFlow}>
          {/* Step 1 */}
          <div className={styles.stepItem} style={{ transitionDelay: `${services[0].delay}s` }}>
            <div className={`${styles.iconBase} ${styles.iconYellow}`}>
              {services[0].icon}
            </div>
            <h3 className={styles.stepTitle}>{services[0].title}</h3>
            <p className={styles.stepText}>{services[0].description}</p>
          </div>

          {/* Connector 1→2: dots + dashes + dots */}
          <div className={styles.connector}>
            <span className={styles.connectorDot} />
            <span className={styles.connectorLine} />
            <span className={styles.connectorDot} />
          </div>

          {/* Step 2 */}
          <div className={styles.stepItem} style={{ transitionDelay: `${services[1].delay}s` }}>
            <div className={`${styles.iconBase} ${styles.iconYellow}`}>
              {services[1].icon}
            </div>
            <h3 className={styles.stepTitle}>{services[1].title}</h3>
            <p className={styles.stepText}>{services[1].description}</p>
          </div>

          {/* Connector 2→3: dots + dashes + dots */}
          <div className={styles.connector}>
            <span className={styles.connectorDot} />
            <span className={styles.connectorLine} />
            <span className={styles.connectorDot} />
          </div>

          {/* Step 3 */}
          <div className={styles.stepItem} style={{ transitionDelay: `${services[2].delay}s` }}>
            <div className={`${styles.iconBase} ${styles.iconYellow}`}>
              {services[2].icon}
            </div>
            <h3 className={styles.stepTitle}>{services[2].title}</h3>
            <p className={styles.stepText}>{services[2].description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

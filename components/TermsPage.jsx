'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './TermsPage.module.css';

const sections = [
  { id: 'acceptance', number: '01', label: 'Acceptance of Terms' },
  { id: 'description', number: '02', label: 'Description of Services' },
  { id: 'prohibition', number: '03', label: 'Prohibited Items' },
  { id: 'responsibility', number: '04', label: 'Customer Responsibility' },
  { id: 'liability', number: '05', label: 'Limited Liability' },
  { id: 'closure', number: '06', label: 'Address Closure' },
  { id: 'abandoned', number: '07', label: 'Abandoned Packages' },
  { id: 'indemnification', number: '08', label: 'Indemnification' },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance');
  const contentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.heroBadge}>Legal</div>
          <h1 className={styles.heroTitle}>
            Terms of <span className={styles.accent}>Service</span>
          </h1>
          <p className={styles.heroSub}>
            Last Updated: March 11, 2025 &nbsp;·&nbsp; Please read carefully before using our services.
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="container">
        <div className={styles.layout}>

          {/* Sticky Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <p className={styles.sidebarLabel}>On this page</p>
              <nav className={styles.sidebarNav}>
                {sections.map((s) => (
                  <button
                    key={s.id}
                    className={`${styles.sidebarLink} ${activeSection === s.id ? styles.sidebarLinkActive : ''}`}
                    onClick={() => scrollTo(s.id)}
                  >
                    <span className={styles.sidebarNum}>{s.number}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className={styles.content} ref={contentRef}>

            <section id="acceptance" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>01</span>
                <h2 className={styles.sectionTitle}>Acceptance of Terms</h2>
              </div>
              <p className={styles.para}>
                By accessing or using the services provided by <strong>Monroe</strong>, you agree to be legally bound by these Terms of Service. If you do not agree to these Terms, you may not use our services.
              </p>
            </section>

            <section id="description" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>02</span>
                <h2 className={styles.sectionTitle}>Description of Services</h2>
              </div>
              <p className={styles.para}>
                We provide package receiving, consolidation, storage, and international/domestic reshipping services. Customers may ship packages to our designated address for forwarding to a final destination specified by the customer.
              </p>
            </section>

            <section id="prohibition" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>03</span>
                <h2 className={styles.sectionTitle}>Strict Prohibition of Illegal or Restricted Items</h2>
              </div>
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>🚫</span>
                <div>
                  <p className={styles.warningTitle}>ABSOLUTE PROHIBITION</p>
                  <p className={styles.warningText}>
                    We strictly prohibit the shipment, storage, or forwarding of any illegal, restricted, hazardous, or prohibited items.
                  </p>
                </div>
              </div>
              <p className={styles.para}>This includes, but is not limited to:</p>
              <ul className={styles.list}>
                <li>Controlled substances or illegal drugs</li>
                <li>Firearms, ammunition, explosives</li>
                <li>Hazardous materials</li>
                <li>Items prohibited by U.S. law or destination country law</li>
                <li>Any item acquired through identity theft or unauthorized payment methods</li>
              </ul>
            </section>

            <section id="responsibility" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>04</span>
                <h2 className={styles.sectionTitle}>Customer Responsibility</h2>
              </div>
              <p className={styles.para}>You are fully responsible for:</p>
              <ul className={styles.list}>
                <li>Providing accurate shipping information</li>
                <li>Ensuring the legality of all contents</li>
                <li>Complying with customs regulations</li>
                <li>Paying all applicable shipping fees, duties, and taxes</li>
              </ul>
              <p className={styles.para}>
                We are not responsible for delays caused by customs inspections, incorrect addresses, incomplete paperwork, or carrier errors.
              </p>
            </section>

            <section id="liability" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>05</span>
                <h2 className={styles.sectionTitle}>Limited Liability &amp; Compensation Policy</h2>
              </div>
              <p className={styles.para}>
                We take reasonable care in handling shipments. However, in the event that we mishandle a package, ship to the wrong address due to our internal processing error, or otherwise make a verified operational mistake, our liability is strictly limited as follows:
              </p>
              <div className={styles.highlightCard}>
                <p className={styles.highlightLabel}>Compensation Cap</p>
                <p className={styles.highlightValue}>50% of verified item value — up to <strong>$400 USD</strong> per shipment</p>
              </div>
              <p className={styles.para}>We are <strong>not</strong> liable for:</p>
              <ul className={styles.list}>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits</li>
                <li>Carrier-related damage or loss once shipped</li>
                <li>Customs seizure or delays</li>
                <li>Force majeure events (including seizure due to client sending illegal contents)</li>
              </ul>
            </section>

            <section id="closure" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>06</span>
                <h2 className={styles.sectionTitle}>No Responsibility for Address Closure or Unforeseen Events</h2>
              </div>
              <p className={styles.para}>
                If our receiving address becomes unavailable, closed, suspended, or inaccessible due to government action, lease termination, natural disasters, postal restrictions, regulatory issues, landlord actions, business interruption, or any unforeseen or uncontrollable event, the Company shall not be held liable for:
              </p>
              <ul className={styles.list}>
                <li>Packages already in transit</li>
                <li>Packages held at the address</li>
                <li>Packages delayed or returned</li>
                <li>Any associated losses</li>
              </ul>
            </section>

            <section id="abandoned" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>07</span>
                <h2 className={styles.sectionTitle}>Abandoned Packages</h2>
              </div>
              <p className={styles.para}>
                Packages not claimed or paid for within <strong>30 days</strong> may be considered abandoned and may be disposed of at the Company's discretion without compensation.
              </p>
            </section>

            <section id="indemnification" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>08</span>
                <h2 className={styles.sectionTitle}>Indemnification</h2>
              </div>
              <p className={styles.para}>
                You agree to indemnify and hold harmless Monroe, its employees, contractors, and affiliates from any claims, damages, losses, or legal actions arising from:
              </p>
              <ul className={styles.list}>
                <li>Your misuse of the Services</li>
                <li>Illegal shipment contents</li>
                <li>Violation of these Terms</li>
                <li>Customs violations</li>
                <li>Fraudulent purchases</li>
              </ul>
            </section>

            <div className={styles.footer}>
              <p>Questions about our Terms? <a href="mailto:info@onpoint.com" className={styles.footerLink}>Contact us</a></p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

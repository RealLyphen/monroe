'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './TermsPage.module.css';

const sections = [
  { id: 'overview',      number: '01', label: 'Overview' },
  { id: 'collection',   number: '02', label: 'Information We Collect' },
  { id: 'usage',        number: '03', label: 'How We Use Your Data' },
  { id: 'sharing',      number: '04', label: 'Sharing & Disclosure' },
  { id: 'retention',    number: '05', label: 'Data Retention' },
  { id: 'cookies',      number: '06', label: 'Cookies & Tracking' },
  { id: 'security',     number: '07', label: 'Security' },
  { id: 'rights',       number: '08', label: 'Your Rights' },
  { id: 'thirdparty',   number: '09', label: 'Third-Party Services' },
  { id: 'changes',      number: '10', label: 'Policy Changes' },
  { id: 'contact',      number: '11', label: 'Contact Us' },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
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
            Privacy <span className={styles.accent}>Policy</span>
          </h1>
          <p className={styles.heroSub}>
            Last Updated: March 11, 2025 &nbsp;·&nbsp; Your privacy matters to us. Read how we handle your data.
          </p>
        </div>
      </div>

      {/* Content */}
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
          <main className={styles.content}>

            {/* 01 */}
            <section id="overview" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>01</span>
                <h2 className={styles.sectionTitle}>Overview</h2>
              </div>
              <p className={styles.para}>
                Monroe ("<strong>we</strong>", "<strong>our</strong>", or "<strong>us</strong>") operates as a reshipping and package-forwarding platform. This Privacy Policy explains how we collect, use, store, and protect information about you when you use our website, dashboard, and services.
              </p>
              <p className={styles.para}>
                By using Monroe, you acknowledge and agree to the practices described in this Privacy Policy. If you do not agree, please discontinue use of our services.
              </p>
            </section>

            {/* 02 */}
            <section id="collection" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>02</span>
                <h2 className={styles.sectionTitle}>Information We Collect</h2>
              </div>
              <p className={styles.para}>We collect the following categories of information to operate our reshipping service:</p>
              <p className={styles.para}><strong>Account & Identity Information</strong></p>
              <ul className={styles.list}>
                <li>Full name, email address, and password</li>
                <li>Phone number (for shipment notifications)</li>
                <li>Government-issued ID where required for customs compliance</li>
              </ul>
              <p className={styles.para} style={{ marginTop: '16px' }}><strong>Shipping & Package Information</strong></p>
              <ul className={styles.list}>
                <li>Delivery addresses (origin and destination)</li>
                <li>Package tracking numbers and declared contents</li>
                <li>Shipment weight, dimensions, and declared value</li>
                <li>Customs documentation and invoices submitted by you</li>
              </ul>
              <p className={styles.para} style={{ marginTop: '16px' }}><strong>Payment Information</strong></p>
              <ul className={styles.list}>
                <li>Billing address and payment method (processed via secure third-party processors — we do not store raw card data)</li>
                <li>Transaction history and invoice records</li>
              </ul>
              <p className={styles.para} style={{ marginTop: '16px' }}><strong>Technical & Usage Data</strong></p>
              <ul className={styles.list}>
                <li>IP address, browser type, and device information</li>
                <li>Pages visited, time spent, and click behavior on our platform</li>
                <li>Cookies and session identifiers (see Section 06)</li>
              </ul>
            </section>

            {/* 03 */}
            <section id="usage" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>03</span>
                <h2 className={styles.sectionTitle}>How We Use Your Data</h2>
              </div>
              <p className={styles.para}>We use your information strictly for operational and legal purposes:</p>
              <ul className={styles.list}>
                <li>Processing, receiving, consolidating, and forwarding your packages</li>
                <li>Verifying your identity and preventing fraudulent activity</li>
                <li>Generating customs declarations and complying with import/export regulations</li>
                <li>Sending shipment status updates, tracking notifications, and service alerts</li>
                <li>Charging applicable fees, shipping costs, storage fees, and duties</li>
                <li>Responding to your support requests and inquiries</li>
                <li>Improving our platform and detecting technical issues</li>
                <li>Complying with applicable laws, regulations, and court orders</li>
              </ul>
              <p className={styles.para}>
                We do <strong>not</strong> sell your personal data to third parties, nor do we use it for advertising or marketing without your explicit consent.
              </p>
            </section>

            {/* 04 */}
            <section id="sharing" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>04</span>
                <h2 className={styles.sectionTitle}>Sharing & Disclosure</h2>
              </div>
              <p className={styles.para}>We may share your information only in the following limited circumstances:</p>
              <ul className={styles.list}>
                <li><strong>Shipping carriers</strong> (e.g., FedEx, DHL, UPS, USPS) — to process and deliver your shipments</li>
                <li><strong>Customs authorities</strong> — as required by destination country import/export laws</li>
                <li><strong>Payment processors</strong> — to securely handle billing transactions</li>
                <li><strong>Law enforcement or government agencies</strong> — when legally required or to prevent fraud and illegal activity</li>
                <li><strong>Service providers</strong> — cloud hosting, analytics, and customer support tools under strict confidentiality agreements</li>
              </ul>
              <div className={styles.highlightCard}>
                <p className={styles.highlightLabel}>Our Commitment</p>
                <p className={styles.highlightValue}>We never sell, rent, or trade your personal information to advertisers or data brokers.</p>
              </div>
            </section>

            {/* 05 */}
            <section id="retention" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>05</span>
                <h2 className={styles.sectionTitle}>Data Retention</h2>
              </div>
              <p className={styles.para}>
                We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy, or as required by law:
              </p>
              <ul className={styles.list}>
                <li><strong>Account data</strong> — retained for the duration of your account and up to 2 years after closure</li>
                <li><strong>Shipment & customs records</strong> — retained for 5–7 years to comply with import/export regulations</li>
                <li><strong>Payment records</strong> — retained for 7 years for tax and accounting compliance</li>
                <li><strong>Support communications</strong> — retained for 2 years from last interaction</li>
              </ul>
              <p className={styles.para}>
                When your data is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            {/* 06 */}
            <section id="cookies" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>06</span>
                <h2 className={styles.sectionTitle}>Cookies & Tracking</h2>
              </div>
              <p className={styles.para}>
                We use cookies and similar technologies to keep you signed in and improve your experience on our platform. The types we use:
              </p>
              <ul className={styles.list}>
                <li><strong>Essential cookies</strong> — required for authentication, session management, and security</li>
                <li><strong>Analytics cookies</strong> — help us understand how users interact with our platform (e.g., page views, errors)</li>
                <li><strong>Preference cookies</strong> — remember your settings such as language or timezone</li>
              </ul>
              <p className={styles.para}>
                You can control cookie behavior through your browser settings. Disabling essential cookies may prevent you from accessing core features of our platform.
              </p>
            </section>

            {/* 07 */}
            <section id="security" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>07</span>
                <h2 className={styles.sectionTitle}>Security of Your Data</h2>
              </div>
              <p className={styles.para}>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className={styles.list}>
                <li>All data transmitted between your browser and our servers is encrypted via TLS/HTTPS</li>
                <li>Passwords are hashed using modern one-way algorithms — we never store plaintext passwords</li>
                <li>Payment data is handled exclusively by PCI-DSS compliant third-party processors</li>
                <li>Access to personal data is restricted to authorized personnel on a need-to-know basis</li>
                <li>Regular security audits and vulnerability assessments are performed</li>
              </ul>
              <div className={styles.warningCard}>
                <span className={styles.warningIcon}>⚠️</span>
                <div>
                  <p className={styles.warningTitle}>Important Notice</p>
                  <p className={styles.warningText}>
                    No system is 100% secure. If you suspect unauthorized access to your account, contact us immediately and change your password.
                  </p>
                </div>
              </div>
            </section>

            {/* 08 */}
            <section id="rights" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>08</span>
                <h2 className={styles.sectionTitle}>Your Rights & Choices</h2>
              </div>
              <p className={styles.para}>
                Depending on your jurisdiction, you may have the following rights regarding your personal data:
              </p>
              <ul className={styles.list}>
                <li><strong>Access</strong> — request a copy of the data we hold about you</li>
                <li><strong>Correction</strong> — request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion</strong> — request deletion of your account and associated personal data (subject to legal retention requirements)</li>
                <li><strong>Portability</strong> — request your data in a machine-readable format</li>
                <li><strong>Opt-out</strong> — opt out of non-essential communications and analytics at any time</li>
              </ul>
              <p className={styles.para}>
                To exercise any of these rights, contact us at the email listed in Section 11. We will respond within 30 days.
              </p>
            </section>

            {/* 09 */}
            <section id="thirdparty" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>09</span>
                <h2 className={styles.sectionTitle}>Third-Party Services</h2>
              </div>
              <p className={styles.para}>
                Our platform may integrate with the following third-party services, each governed by their own privacy policies:
              </p>
              <ul className={styles.list}>
                <li><strong>Shipping carriers</strong> — FedEx, DHL, UPS, USPS, Maersk, and others for package delivery</li>
                <li><strong>Payment processors</strong> — for secure billing (e.g., Stripe, PayPal)</li>
                <li><strong>Analytics providers</strong> — for platform performance monitoring</li>
                <li><strong>Customer support tools</strong> — for handling inquiries via chat or email</li>
              </ul>
              <p className={styles.para}>
                We encourage you to review the privacy policies of any third party whose services you use in connection with Monroe.
              </p>
            </section>

            {/* 10 */}
            <section id="changes" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>10</span>
                <h2 className={styles.sectionTitle}>Changes to This Policy</h2>
              </div>
              <p className={styles.para}>
                We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or services. When we make material changes, we will:
              </p>
              <ul className={styles.list}>
                <li>Update the "Last Updated" date at the top of this page</li>
                <li>Notify you via email (if you have an account) or via an in-app banner</li>
              </ul>
              <p className={styles.para}>
                Your continued use of Monroe after any changes constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* 11 */}
            <section id="contact" className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>11</span>
                <h2 className={styles.sectionTitle}>Contact Us</h2>
              </div>
              <p className={styles.para}>
                If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach out to our privacy team:
              </p>
              <div className={styles.highlightCard}>
                <p className={styles.highlightLabel}>Privacy Contact</p>
                <p className={styles.highlightValue}>
                  <strong>Monroe Privacy Team</strong><br />
                  Email: <a href="mailto:privacy@monroe.com" style={{ color: '#f5c518', textDecoration: 'none' }}>privacy@monroe.com</a><br />
                  Response time: within 30 business days
                </p>
              </div>
            </section>

            <div className={styles.footer}>
              <p>Also see our <a href="/terms" className={styles.footerLink}>Terms of Service</a> for additional details on your obligations and our liability.</p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}

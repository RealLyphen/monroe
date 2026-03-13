'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiMapPin, FiPhone, FiSend, FiChevronRight } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            {/* About Column */}
            <div className={styles.col}>
              <Link href="/" className={styles.logo}>
                <Image src="/logo.png" alt="Monroe Logo" width={180} height={40} style={{ objectFit: 'contain' }} />
              </Link>
              <p className={styles.aboutText}>
                Providing secure, untraceable reshipping with uncompromising OPSEC. Your trusted partner for stealth logistics.
              </p>
              <ul className={styles.contactList}>
                <li>
                  <FiSend className={styles.contactIcon} />
                  <span>End-to-end encrypted protocol.</span>
                </li>
                <li>
                  <FiMapPin className={styles.contactIcon} />
                  <span>100% discretion guaranteed.</span>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Platform</h4>
              <ul className={styles.linkList}>
                <li><Link href="/"><FiChevronRight /> Home</Link></li>
                <li><Link href="/about"><FiChevronRight /> About Us</Link></li>
                <li><Link href="/reviews"><FiChevronRight /> Reviews</Link></li>
                <li><Link href="/#faq-section"><FiChevronRight /> FAQ</Link></li>
                <li><a href="https://t.me/demo" target="_blank" rel="noopener noreferrer"><FiChevronRight /> Contact Us</a></li>
              </ul>
            </div>

            {/* Features Links */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Features</h4>
              <ul className={styles.linkList}>
                <li><Link href="/"><FiChevronRight /> Residential Addresses</Link></li>
                <li><Link href="/"><FiChevronRight /> Stealth Packaging</Link></li>
                <li><Link href="/"><FiChevronRight /> Crypto Payments</Link></li>
                <li><Link href="/"><FiChevronRight /> PGP Communications</Link></li>
                <li><Link href="/"><FiChevronRight /> Secure Dashboard</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Newsletter</h4>
              <p className={styles.newsletterText}>
                Stay updated with our latest security protocols and platform updates. Your email is encrypted and never shared.
              </p>
              <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your email address" className={styles.newsletterInput} />
                <button type="submit" className={styles.newsletterBtn} aria-label="Subscribe">
                  <FiSend />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p>© {new Date().getFullYear()} Monroe. All Rights Reserved.</p>
            <div className={styles.bottomLinks}>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <a href="https://t.me/demo" target="_blank" rel="noopener noreferrer">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

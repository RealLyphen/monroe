'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiUser, FiChevronDown, FiLogOut, FiLayout } from 'react-icons/fi';
import { gsap } from 'gsap';
import styles from './Header.module.css';
import LoginPopup from './LoginPopup';

const navLinks = [
  { label: 'Home', href: '/' },
];

function scrollToProcess() {
  const el = document.getElementById('process-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function scrollToFAQ() {
  const el = document.getElementById('faq-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const ctaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.authenticated) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileOpen]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (logoRef.current) {
      tl.fromTo(logoRef.current,
        { opacity: 0, x: -20, filter: 'blur(10px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.8, delay: 0.1 }
      );
    }

    if (navRef.current) {
      const links = navRef.current.querySelectorAll('a, button');
      tl.fromTo(links,
        { opacity: 0, y: -15, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5, stagger: 0.1 },
        '-=0.5'
      );
    }

    if (ctaRef.current) {
      tl.fromTo(ctaRef.current,
        { opacity: 0, x: 20, filter: 'blur(10px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.6 },
        '-=0.3'
      );
    }

    return () => tl.kill();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setLoginOpen(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setDropdownOpen(false);
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo} ref={logoRef}>
            <Image src="/logo.png" alt="Monroe Logo" width={180} height={40} style={{ objectFit: 'contain' }} />
          </Link>

          <nav className={styles.nav} ref={navRef}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              className={styles.navLink}
              onClick={scrollToProcess}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
            >
              Process
            </button>
            <Link
              href="/reviews"
              className={`${styles.navLink} ${pathname === '/reviews' ? styles.active : ''}`}
            >
              Reviews
            </Link>
            <button
              className={styles.navLink}
              onClick={scrollToFAQ}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
            >
              FAQ
            </button>
          </nav>

          <div className={styles.actions}>
            {authChecked && user ? (
              <div className={styles.profileWrap} ref={dropdownRef}>
                <button
                  className={styles.profileBtn}
                  ref={ctaRef}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <div className={styles.avatar}>
                    {user.username.charAt(0)}
                  </div>
                  <span>{user.username}</span>
                  <FiChevronDown style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                </button>

                <div className={`${styles.dropdown} ${dropdownOpen ? styles.open : ''}`}>
                  <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                    <FiLayout /> Visit Panel
                  </Link>
                  <button className={`${styles.dropdownItem} ${styles.danger}`} onClick={handleLogout}>
                    <FiLogOut /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={styles.ctaBtn}
                ref={ctaRef}
                onClick={() => setLoginOpen(true)}
              >
                Sign in
              </button>
            )}
            <button
              className={styles.menuBtn}
              onClick={() => setIsMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileOverlay} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobilePanel}>
          <div className={styles.mobileHeader}>
            <Link href="/" className={styles.logo} onClick={() => setIsMobileOpen(false)}>
              <Image src="/logo.png" alt="Monroe Logo" width={160} height={35} style={{ objectFit: 'contain' }} />
            </Link>
            <button
              className={styles.closeBtn}
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <FiX />
            </button>
          </div>
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              className={styles.mobileNavLink}
              onClick={() => { scrollToProcess(); setIsMobileOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', font: 'inherit' }}
            >
              Process
            </button>
            <Link
              href="/reviews"
              className={`${styles.mobileNavLink} ${pathname === '/reviews' ? styles.active : ''}`}
              onClick={() => setIsMobileOpen(false)}
            >
              Reviews
            </Link>
            <button
              className={styles.mobileNavLink}
              onClick={() => { scrollToFAQ(); setIsMobileOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', font: 'inherit' }}
            >
              FAQ
            </button>
          </nav>
          <div className={styles.mobileContact}>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={styles.mobileCta}
                  onClick={() => setIsMobileOpen(false)}
                  style={{ marginBottom: '10px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Visit Panel
                </Link>
                <button
                  className={styles.mobileCta}
                  onClick={() => { handleLogout(); setIsMobileOpen(false); }}
                >
                  Sign out ({user.username})
                </button>
              </>
            ) : (
              <button
                className={styles.mobileCta}
                onClick={() => { setLoginOpen(true); setIsMobileOpen(false); }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

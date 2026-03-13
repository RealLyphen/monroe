'use client';
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FiX, FiKey, FiArrowRight, FiLoader } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import styles from './LoginPopup.module.css';

const TELEGRAM_BOT_URL = 'https://t.me/MonroeReshipBot';

export default function LoginPopup({ isOpen, onClose, onLoginSuccess }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setKey('');
      setError('');
      setLoading(false);
      document.body.style.overflow = 'hidden';

      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(1.4)', delay: 0.1 }
      );
    }

    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(cardRef.current, {
      opacity: 0, y: 20, scale: 0.97, filter: 'blur(6px)',
      duration: 0.25, ease: 'power2.in',
    });
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        document.body.style.overflow = '';
        onClose();
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Please enter your login key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid login key');
        setLoading(false);
        return;
      }

      // Success — animate out then callback
      gsap.to(cardRef.current, {
        opacity: 0, y: -20, scale: 1.02,
        duration: 0.3, ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.1,
        onComplete: () => {
          document.body.style.overflow = '';
          onLoginSuccess(data.user);
        },
      });
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleClose}>
      <div className={styles.card} ref={cardRef} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <FiX />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <FiKey />
          </div>
          <h2 className={styles.title}>Sign In</h2>
          <p className={styles.subtitle}>
            Enter your unique login key to access your Monroe account.
          </p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputWrap}>
            <input
              type="text"
              className={`${styles.input} ${error ? styles.inputError : ''}`}
              placeholder="Paste your login key"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <FiLoader className={styles.spinner} /> Verifying...
              </>
            ) : (
              <>
                Sign In <FiArrowRight />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>Don&apos;t have a key?</span>
        </div>

        {/* Generate key via Telegram */}
        <a
          href={TELEGRAM_BOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.telegramBtn}
        >
          <FaTelegramPlane />
          Generate Key via Telegram
        </a>

        <p className={styles.footerNote}>
          Your key is permanent and tied to your Telegram account.
        </p>
      </div>
    </div>
  );
}

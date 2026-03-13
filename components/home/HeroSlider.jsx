'use client';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { FaTelegramPlane } from 'react-icons/fa';
import { gsap } from 'gsap';
import styles from './HeroSlider.module.css';

const Globe = dynamic(() => import('./AceternityGlobe'), { ssr: false });

export default function HeroSlider() {
  const subtitleRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const ctaRef = useRef(null);
  const telegramRef = useRef(null);
  const scrollRef = useRef(null);
  const globeRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 30, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, delay: 0.4 }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: 50, filter: 'blur(15px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 },
      '-=0.4'
    )
    .fromTo(textRef.current,
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 },
      '-=0.5'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 20, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6 },
      '-=0.4'
    )
    .fromTo(telegramRef.current,
      { opacity: 0, x: -20, filter: 'blur(8px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.6 },
      '-=0.3'
    );

    if (globeRef.current) {
      tl.fromTo(globeRef.current,
        { opacity: 0, filter: 'blur(20px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 1.2 },
        '-=1.5'
      );
    }

    if (scrollRef.current) {
      tl.fromTo(scrollRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.2'
      );
    }

    return () => tl.kill();
  }, []);

  return (
    <section className={styles.hero}>
      {/* Background */}
      <div className={styles.bgLayer} />

      {/* Animated grid */}
      <div className={styles.gridOverlay}>
        {[...Array(20)].map((_, i) => (
          <div key={i} className={styles.gridLine} style={{ left: `${(i + 1) * 5}%` }} />
        ))}
      </div>

      {/* Floating shapes */}
      <div className={styles.shapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      {/* Content */}
      <div className="container">
        <div className={styles.heroGrid}>
          {/* Left: Text Content */}
          <div className={styles.content}>
            <div className={styles.slide}>
              <div className={styles.subtitleWrap} ref={subtitleRef}>
                <span className={styles.subtitleLine}></span>
                <span className={styles.subtitle}>#1 Reshipping Platform</span>
              </div>
              <h1 className={styles.title} ref={titleRef}>
                Start
                <br />
                <span className={styles.highlight}>Reshipping</span>{' '}the
                <br />
                Easy Way
              </h1>
              <p className={styles.text} ref={textRef}>
                We provide a seamless way to start your reshipping journey, focusing on reliability, efficiency, and trusted service to help clients manage shipments smoothly.
              </p>
              <div className={styles.actions}>
                <Link href="/about" className={styles.ctaBtn} ref={ctaRef}>
                  Discover More <FiArrowRight />
                </Link>
                <a href="https://t.me/monroe" target="_blank" rel="noopener noreferrer" className={styles.phoneLink} ref={telegramRef}>
                  <div className={styles.phoneIcon}><FaTelegramPlane /></div>
                  <div>
                    <span className={styles.phoneLabel}>Need help?</span>
                    <span className={styles.phoneNumber}>Contact on Telegram</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right: 3D Globe */}
          <div className={styles.globeWrap} ref={globeRef}>
            <Globe />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} ref={scrollRef}>
        <div className={styles.scrollMouse}>
          <div className={styles.scrollWheel}></div>
        </div>
        <span>Scroll Down</span>
      </div>
    </section>
  );
}

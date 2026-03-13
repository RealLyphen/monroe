'use client';
import { useEffect } from 'react';

import HeroSlider from '@/components/home/HeroSlider';
import ServicesSection from '@/components/home/ServicesSection';
import HomeFAQSection from '@/components/home/HomeFAQSection';
import ReviewsTeaser from '@/components/home/ReviewsTeaser';
import CTABanner from '@/components/home/CTABanner';

export default function Home() {
  useEffect(() => {
    // Remove preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('loaded'), 500);
    }

    // Scroll to top button
    const handleScroll = () => {
      const btn = document.getElementById('scrollTop');
      if (btn) {
        btn.classList.toggle('visible', window.scrollY > 400);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>

      <main>
        <HeroSlider />
        <ServicesSection />
        <HomeFAQSection />
        <ReviewsTeaser />
        <CTABanner />
      </main>

      <button id="scrollTop" className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
        ↑
      </button>
    </>
  );
}

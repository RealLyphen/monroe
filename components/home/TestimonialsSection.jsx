'use client';
import { useState } from 'react';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaQuoteRight } from 'react-icons/fa';
import styles from './TestimonialsSection.module.css';

const testimonials = [
  { name: 'Nafiz Bhuiyan', role: 'Manager', rating: 5, text: 'OnPoint transformed our supply chain operations. Their real-time tracking and dedicated support team ensured every shipment arrived on time. A truly exceptional service provider.' },
  { name: 'Robert Wilson', role: 'CEO', rating: 5, text: 'Working with OnPoint has been a game-changer for our business. Their logistics expertise and attention to detail have significantly reduced our delivery times and costs.' },
  { name: 'Sarah Chen', role: 'Director', rating: 5, text: 'The level of professionalism and reliability from OnPoint is outstanding. They handle our complex logistics needs with ease and always communicate proactively.' },
  { name: 'Mainto Vula', role: 'Manager', rating: 4, text: 'Highly recommend OnPoint for any business looking to streamline their logistics. Their technology-driven approach and customer-first mentality set them apart from competitors.' },
];

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.header}>
            <span className="section-tagline">Client Testimonials</span>
            <h2 className="section-title">What our clients say<br/>about us</h2>
          </div>
          <div className={styles.slider}>
            <div className={styles.card}>
              <FaQuoteRight className={styles.quote} />
              <div className={styles.rating}>
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={i < testimonials[current].rating ? styles.starFilled : styles.star} />
                ))}
              </div>
              <p className={styles.text}>{testimonials[current].text}</p>
              <div className={styles.author}>
                <div className={styles.avatar}>
                  {testimonials[current].name.charAt(0)}
                </div>
                <div>
                  <h4 className={styles.name}>{testimonials[current].name}</h4>
                  <span className={styles.role}>{testimonials[current].role}</span>
                </div>
              </div>
            </div>
            <div className={styles.controls}>
              <button onClick={prev} className={styles.navBtn} aria-label="Previous"><FiChevronLeft /></button>
              <span className={styles.counter}>{current + 1} / {testimonials.length}</span>
              <button onClick={next} className={styles.navBtn} aria-label="Next"><FiChevronRight /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';
import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaInstagram, FaLinkedinIn, FaTwitter, FaFacebookF } from 'react-icons/fa';
import styles from './TeamCarousel.module.css';

const members = [
  { name: 'Brooklyn Simmons', role: 'Quick Cargo Manager' },
  { name: 'Sakib Hasan', role: 'Speedy Trans Director' },
  { name: 'Fahda Hossain', role: 'Efficient Transport Lead' },
  { name: 'Alex Morgan', role: 'Operations Manager' },
];

export default function TeamCarousel() {
  const [start, setStart] = useState(0);
  const visible = 3;
  const next = () => setStart((s) => (s + 1) % members.length);
  const prev = () => setStart((s) => (s - 1 + members.length) % members.length);
  const getVisible = () => {
    const items = [];
    for (let i = 0; i < Math.min(visible, members.length); i++) {
      items.push(members[(start + i) % members.length]);
    }
    return items;
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className="section-tagline">Our Team</span>
            <h2 className="section-title">Meet our expert logistics team</h2>
          </div>
          <div className={styles.navBtns}>
            <button onClick={prev} className={styles.navBtn} aria-label="Previous"><FiChevronLeft /></button>
            <button onClick={next} className={styles.navBtn} aria-label="Next"><FiChevronRight /></button>
          </div>
        </div>
        <div className={styles.grid}>
          {getVisible().map((member, i) => (
            <div key={`${member.name}-${i}`} className={styles.card}>
              <div className={styles.cardImg}>
                <div className={styles.imgPlaceholder}>
                  <span>{member.name.charAt(0)}</span>
                </div>
                <div className={styles.socials}>
                  <a href="#"><FaInstagram /></a>
                  <a href="#"><FaLinkedinIn /></a>
                  <a href="#"><FaTwitter /></a>
                  <a href="#"><FaFacebookF /></a>
                </div>
              </div>
              <div className={styles.cardContent}>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

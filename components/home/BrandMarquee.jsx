'use client';
import styles from './BrandMarquee.module.css';

const brands = ['FedEx', 'DHL', 'UPS', 'Maersk', 'Amazon', 'USPS', 'TNT', 'Aramex', 'DB Schenker', 'XPO'];

export default function BrandMarquee() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={styles.text}>
          Trusted by <strong>150+</strong> companies worldwide
        </p>
      </div>
      <div className={styles.marquee}>
        <div className={styles.track}>
          {[...brands, ...brands].map((brand, i) => (
            <div key={i} className={styles.brand}>
              <span className={styles.brandLogo}>{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

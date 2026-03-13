'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  return (
    <>
      {!isDashboard && <Header />}
      {children}
      {!isDashboard && <Footer />}
    </>
  );
}

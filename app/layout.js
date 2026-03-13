
import PreloaderDismiss from "@/components/PreloaderDismiss";
import "./globals.css";

export const metadata = {
  title: "Monroe - #1 Reshipping Platform",
  description: "Monroe is the #1 reshipping platform. Start reshipping the easy way with reliable, fast, and seamless logistics solutions.",
};

import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="preloader" id="preloader">
          <div className="preloader-spinner"></div>
        </div>
        <PreloaderDismiss />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}


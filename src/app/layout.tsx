import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic, Cairo } from 'next/font/google';
import './globals.css';
import { SlotCareProvider } from '@/context/SlotCareContext';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SlotCare — المنصة الذكية لاسترجاع المواعيد الملغاة وقوائم الانتظار',
  description: 'حل برمجي فوري للعيادات الطبية لاسترجاع المواعيد الملغاة آلياً عبر الواتساب في ثوانٍ معدودة',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${ibmPlexArabic.variable} ${cairo.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-ibm">
        <SlotCareProvider>{children}</SlotCareProvider>
      </body>
    </html>
  );
}

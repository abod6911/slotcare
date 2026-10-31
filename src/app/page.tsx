'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-ibm" dir="rtl">
      <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4" />
      <h2 className="text-base font-bold text-slate-800">جاري توجيهك إلى لوحة التحكم...</h2>
      <p className="text-xs text-slate-500 mt-2">منصة SlotCare الذكية لاسترجاع المواعيد الملغاة</p>
      <noscript>
        <meta httpEquiv="refresh" content="0;url=./dashboard/" />
      </noscript>
    </div>
  );
}
